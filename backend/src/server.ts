// src/server.ts
// Main application entry point — compatible with both local Node and Vercel serverless.
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
const PORT     = process.env.PORT ? parseInt(process.env.PORT, 10) : (config.get('port') ?? 8000);
const NODE_ENV = config.get('nodeEnv');

app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = new Set<string>([
  'http://localhost:3000',
  'https://social-scrapper-wa4g.vercel.app',
  'https://social-scrapper-sigma.vercel.app',
]);
if (process.env['FRONTEND_URL']) {
  ALLOWED_ORIGINS.add(process.env['FRONTEND_URL'].replace(/\/$/, ''));
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.has(origin)) return callback(null, true);
    callback(new Error(`CORS: origin not allowed — ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.debug(`${req.method} ${req.url}`);
  next();
});

// ── Health / root endpoints (no Firebase, no heavy deps) ─────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name:        'Social Intelligence Platform API',
    version:     '1.0.0',
    environment: NODE_ENV,
    endpoints: [
      '/api/dashboard', '/api/profiles', '/api/posts', '/api/analysis',
      '/api/reports',   '/api/media',    '/api/jobs',
      '/api/logs',      '/api/settings', '/api/scheduler',
    ],
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── API routers ───────────────────────────────────────────────────────────────
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

// ── 404 / error handlers ──────────────────────────────────────────────────────
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

// ── Dynamic handler wiring (lazy — only for endpoints that need Playwright/Telegram) ──
let isWired = false;
export async function wireDynamicHandlers(): Promise<void> {
  if (isWired) return;
  isWired = true;
  try {
    const { initScheduler, runProfileScan } = await import('./scheduler');
    const { ProfileRepository }      = await import('./repositories/profile.repository');
    const { PostRepository }         = await import('./repositories/post.repository');
    const { MediaRepository }        = await import('./repositories/media.repository');
    const { AnalysisRepository }     = await import('./repositories/analysis.repository');
    const { ReportRepository }       = await import('./repositories/report.repository');
    const { JobRepository }          = await import('./repositories/job.repository');
    const { PipelineWorker }         = await import('./workers/pipeline.worker');
    const { ScraperService }         = await import('./services/scraper.service');
    const { InMemoryJobQueue }       = await import('./jobs/InMemoryJobQueue');
    const { FirebaseStorageProvider } = await import('./providers/storage/firebase');
    const { FrameSamplerService }    = await import('./services/frame.sampler.service');
    const { ReportGenerator }        = await import('./services/report/ReportGenerator');
    const { NotificationService }    = await import('./services/notification.service');
    const { TelegramProvider }       = await import('./providers/notification/telegram');
    const { InstagramProvider }      = await import('./providers/social/instagram');
    const { InstagramHTTPClient }    = await import('./providers/social/instagram.http.client');

    const cfg          = config;
    const notifCfg     = cfg.get('notifications');
    const frameCfg     = cfg.get('frameSampling');

    const storage         = new FirebaseStorageProvider();
    const frameSampler    = new FrameSamplerService(frameCfg);
    const reportGenerator = new ReportGenerator();
    const telegram        = new TelegramProvider(notifCfg.telegram.botToken!, notifCfg.telegram.chatId!);
    const notifications   = new NotificationService(telegram);
    const telegramChatId  = notifCfg.telegram.chatId!;

    const profileRepo  = new ProfileRepository();
    const postRepo     = new PostRepository();
    const mediaRepo    = new MediaRepository();
    const analysisRepo = new AnalysisRepository();
    const reportRepo   = new ReportRepository();
    const jobRepo      = new JobRepository();

    const pipelineWorker = new PipelineWorker(
      storage, frameSampler, reportGenerator, notifications,
      postRepo, mediaRepo, analysisRepo, reportRepo, profileRepo,
      telegramChatId
    );

    const scraperTimeout = cfg.get('scraper').timeout;
    const igClient   = new InstagramHTTPClient(scraperTimeout);
    const igProvider = new InstagramProvider(igClient);
    const jobQueue   = new InMemoryJobQueue();
    const scraper    = new ScraperService(igProvider, storage, profileRepo, postRepo, mediaRepo, jobQueue);

    try { await telegram.checkHealth(); }
    catch (err) { logger.error('Telegram health check failed', { error: err }); }

    schedulerHandlers.runProfileScan = async () => {
      logger.info('POST /scheduler/run: manual trigger');
      return runProfileScan();
    };

    profilesHandlers.processProfile = async (profileId: string) => {
      const profile = await profileRepo.findById(profileId);
      if (!profile) throw new Error('Profile not found');
      const unprocessed = await postRepo.getUnprocessedPosts(profileId);
      const results: Array<{ postId: string; ok: boolean; error?: string }> = [];
      for (const post of unprocessed) {
        try { await pipelineWorker.processPost(post.id); results.push({ postId: post.id, ok: true }); }
        catch (err) { results.push({ postId: post.id, ok: false, error: err instanceof Error ? err.message : String(err) }); }
      }
      return { profileId, results };
    };

    profilesHandlers.scanProfile = async (profileId: string) => {
      const profile = await profileRepo.findById(profileId);
      if (!profile) throw new Error('Profile not found');
      await scraper.scrapeProfile(profileId);
      const unprocessed = await postRepo.getUnprocessedPosts(profileId);
      const results: Array<{ postId: string; ok: boolean; error?: string }> = [];
      for (const post of unprocessed) {
        try { await pipelineWorker.processPost(post.id); results.push({ postId: post.id, ok: true }); }
        catch (err) { results.push({ postId: post.id, ok: false, error: err instanceof Error ? err.message : String(err) }); }
      }
      return { profileId, scraped: true, processed: results.length, results };
    };

    reportsHandlers.sendReport = async (reportId: string) => {
      const report = await reportRepo.findById(reportId);
      if (!report) throw new Error('Report not found');
      let documentPath: string | undefined;
      if (report.filePath) {
        const isCloudUrl = report.filePath.startsWith('http://') || report.filePath.startsWith('https://');
        if (!isCloudUrl) {
          const pathMod = await import('path');
          const htmlRelPath = report.filePath.replace('.md', '.html');
          const candidatePath = pathMod.join(process.cwd(), 'storage', htmlRelPath);
          const fsMod = await import('fs');
          if (fsMod.existsSync(candidatePath)) documentPath = candidatePath;
        }
      }
      const { latencyMs } = await notifications.sendReportToTelegram({
        chatId: telegramChatId, markdown: report.content,
        postId: report.postId ?? undefined, profileId: report.profileId ?? undefined,
        documentPath,
      });
      return { sent: true, latencyMs };
    };

    initScheduler({
      pipelineWorker, profileRepo, postRepo, notifications,
      reportRepo, scraper, telegram, jobRepo, telegramChatId,
    });

    logger.info('✅ Dynamic handlers wired. Scheduler started.');
  } catch (err) {
    isWired = false; // allow retry
    logger.error('wireDynamicHandlers: failed', { error: err });
  }
}

// ── Startup ───────────────────────────────────────────────────────────────────
const IS_VERCEL = !!process.env.VERCEL;

if (!IS_VERCEL) {
  // Local persistent server
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Server running on http://0.0.0.0:${PORT} [${NODE_ENV}]`);
    setImmediate(wireDynamicHandlers);
  });
  process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
  process.on('SIGINT',  () => { server.close(() => process.exit(0)); });
}

// ── Exports ───────────────────────────────────────────────────────────────────
// @vercel/node expects either:
//   module.exports = app      (CommonJS)
//   export default app        (ESM)
// Because tsconfig compiles to CommonJS, we need BOTH to be safe.
export { app };
export default app;
// Vercel CJS interop: the compiled JS sets module.exports.default = app,
// but @vercel/node also checks module.exports directly.
// We assign it here so the handler is always found.
if (typeof module !== 'undefined') {
  module.exports = app;
  module.exports.default = app;
  module.exports.app = app;
  module.exports.wireDynamicHandlers = wireDynamicHandlers;
}