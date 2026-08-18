// src/server.ts
// Main application entry point.
import 'dotenv/config';

import express, { NextFunction, Request, Response } from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import { Config } from './config';
import logger     from './logger';

import profilesRouter, { dynamicHandlers as profilesHandlers }  from './routes/profiles.routes';
import postsRouter     from './routes/posts.routes';
import analysisRouter  from './routes/analysis.routes';
import reportsRouter, { dynamicHandlers as reportsHandlers }   from './routes/reports.routes';
import mediaRouter     from './routes/media.routes';
import settingsRouter  from './routes/settings.routes';
import schedulerRouter, { dynamicHandlers as schedulerHandlers } from './routes/scheduler.routes';
import jobsRouter      from './routes/jobs.routes';
import logsRouter      from './routes/logs.routes';
import dashboardRouter from './routes/dashboard.routes';

const app      = express();
const config   = Config.getInstance();
const PORT     = config.get('port') ?? 8000;
const NODE_ENV = config.get('nodeEnv');

app.use(helmet());
app.use(cors({
  origin:      NODE_ENV === 'production' ? process.env['FRONTEND_URL'] : 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.debug(`${req.method} ${req.url}`);
  next();
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    name:        'Social Intelligence Platform API',
    version:     '1.0.0',
    environment: NODE_ENV,
    endpoints: [
      '/api/profiles', '/api/posts', '/api/analysis',
      '/api/reports',  '/api/media', '/api/jobs',
      '/api/logs',     '/api/settings', '/api/scheduler',
    ],
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// Mount routers
app.use('/api/dashboard', dashboardRouter);
app.use('/api/profiles',  profilesRouter);
app.use('/api/posts',     postsRouter);
app.use('/api/analysis',  analysisRouter);
app.use('/api/reports',   reportsRouter);
app.use('/api/media',     mediaRouter);
app.use('/api/settings',  settingsRouter);
app.use('/api/scheduler', schedulerRouter);
app.use('/api/jobs',      jobsRouter);
app.use('/api/logs',      logsRouter);

// Wire dynamic handlers using mutable exports from route modules
function wireDynamicHandlers(): void {
  setImmediate(async () => {
    try {
      const {
        initScheduler,
        runProfileScan,
        pipelineWorker,
        profileRepo,
        postRepo,
        notifications,
        reportRepo,
        telegramChatId,
        scraper,
        telegram
      } = await import('./scheduler');

      // Health check Telegram
      try {
        await telegram.checkHealth();
      } catch (err) {
        logger.error('Telegram health check failed during startup', { error: err });
      }

      schedulerHandlers.runProfileScan = async () => {
        logger.info('POST /scheduler/run: manual trigger via wired handler');
        return runProfileScan();
      };

      profilesHandlers.processProfile = async (profileId: string) => {
        const profile = await profileRepo.findById(profileId);
        if (!profile) throw new Error('Profile not found');

        const unprocessed = await postRepo.getUnprocessedPosts(profileId);
        const results: Array<{ postId: string; ok: boolean; error?: string }> = [];

        for (const post of unprocessed) {
          try {
            await pipelineWorker.processPost(post.id);
            results.push({ postId: post.id, ok: true });
          } catch (err) {
            results.push({ postId: post.id, ok: false, error: err instanceof Error ? err.message : String(err) });
          }
        }
        return { profileId, results };
      };

      // Wired scan handler: scrape then process
      profilesHandlers.scanProfile = async (profileId: string) => {
        const profile = await profileRepo.findById(profileId);
        if (!profile) throw new Error('Profile not found');
        logger.info(`Manual scan: profile ${profileId} (${profile.username})`);

        // Step 1: scrape new posts
        await scraper.scrapeProfile(profileId);

        // Step 2: process all unprocessed posts
        const unprocessed = await postRepo.getUnprocessedPosts(profileId);
        const results: Array<{ postId: string; ok: boolean; error?: string }> = [];
        for (const post of unprocessed) {
          try {
            await pipelineWorker.processPost(post.id);
            results.push({ postId: post.id, ok: true });
          } catch (err) {
            results.push({ postId: post.id, ok: false, error: err instanceof Error ? err.message : String(err) });
          }
        }
        return { profileId, scraped: true, processed: results.length, results };
      };

      reportsHandlers.sendReport = async (reportId: string) => {
        const report = await reportRepo.findById(reportId);
        if (!report) throw new Error('Report not found');
        
        let documentPath: string | undefined;
        if (report.filePath) {
          const path = await import('path');
          const htmlRelPath = report.filePath.replace('.md', '.html');
          documentPath = path.join(process.cwd(), 'storage', htmlRelPath);
          const fs = await import('fs');
          if (!fs.existsSync(documentPath)) {
            documentPath = undefined;
          }
        }

        const { latencyMs } = await notifications.sendReportToTelegram({
          chatId:    telegramChatId,
          markdown:  report.content,
          postId:    report.postId    ?? undefined,
          profileId: report.profileId ?? undefined,
          documentPath: documentPath,
        });
        return { sent: true, latencyMs };
      };

      initScheduler();
      logger.info('✅ Dynamic handlers wired. Scheduler started.');
    } catch (err) {
      logger.error('wireDynamicHandlers: failed — pipeline endpoints will return 501', { error: err });
    }
  });
}

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error:   NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
});

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT} [${NODE_ENV}]`);
  wireDynamicHandlers();
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM — shutting down');
  server.close(() => { logger.info('Server closed'); process.exit(0); });
});
process.on('SIGINT', () => {
  logger.info('SIGINT — shutting down');
  server.close(() => { logger.info('Server closed'); process.exit(0); });
});

export { app };