// src/scheduler/index.ts
// Full scheduler bootstrap with:
//  - Configurable concurrency (default: 2 simultaneous profiles)
//  - Active-profile Set to prevent duplicate simultaneous runs
//  - Job history persisted to DB (SchedulerRun) on every execution
//  - Scrape + pipeline cascade for each monitored profile

import { Scheduler } from './scheduler';
import { Config }    from '../config';
import { ProfileRepository }    from '../repositories/profile.repository';
import { PostRepository }       from '../repositories/post.repository';
import { MediaRepository }      from '../repositories/media.repository';
import { AnalysisRepository }   from '../repositories/analysis.repository';
import { ReportRepository }     from '../repositories/report.repository';
import { JobRepository }        from '../repositories/job.repository';
import { PipelineWorker }       from '../workers/pipeline.worker';
import { ScraperService }       from '../services/scraper.service';
import { InMemoryJobQueue }     from '../jobs/InMemoryJobQueue';
import { LocalStorageProvider } from '../providers/storage/local';
import { FrameSamplerService }  from '../services/frame.sampler.service';
import { ReportGenerator }      from '../services/report/ReportGenerator';
import { NotificationService }  from '../services/notification.service';
import { TelegramProvider }     from '../providers/notification/telegram';
import { InstagramProvider }    from '../providers/social/instagram';
import { InstagramHTTPClient }  from '../providers/social/instagram.http.client';
import prisma from '../prisma';
import logger from '../logger';

export { Scheduler };

// ─── Shared service singletons ────────────────────────────────────────────────
const cfg          = Config.getInstance();
const notifCfg     = cfg.get('notifications');
const storageCfg   = cfg.get('storage');
const frameCfg     = cfg.get('frameSampling');
const schedulerCfg = cfg.get('scheduler');

const storage       = new LocalStorageProvider(storageCfg.local?.rootPath);
const frameSampler  = new FrameSamplerService(frameCfg);
const reportGenerator = new ReportGenerator();
const telegram      = new TelegramProvider(notifCfg.telegram.botToken!, notifCfg.telegram.chatId!);
const notifications = new NotificationService(telegram);

const profileRepo  = new ProfileRepository();
const postRepo     = new PostRepository();
const mediaRepo    = new MediaRepository();
const analysisRepo = new AnalysisRepository();
const reportRepo   = new ReportRepository();
const jobRepo      = new JobRepository();

const pipelineWorker = new PipelineWorker(
  storage, frameSampler, reportGenerator, notifications,
  postRepo, mediaRepo, analysisRepo, reportRepo, profileRepo,
  notifCfg.telegram.chatId!
);

const igClient   = new InstagramHTTPClient(cfg.get('scraper').timeout);
const igProvider = new InstagramProvider(igClient);
const jobQueue   = new InMemoryJobQueue();
const scraper    = new ScraperService(igProvider, storage, prisma, jobQueue);

export const telegramChatId = notifCfg.telegram.chatId!;

// ─── Concurrency control ──────────────────────────────────────────────────────
const CONCURRENCY    = schedulerCfg.concurrency ?? 2;
const activeProfiles = new Set<string>();

async function processProfile(profileId: string): Promise<void> {
  if (activeProfiles.has(profileId)) {
    logger.warn(`Scheduler: profile ${profileId} already in progress — skipping`);
    return;
  }
  activeProfiles.add(profileId);
  const run = await jobRepo.createSchedulerRun(`process-profile:${profileId}`);

  try {
    await scraper.scrapeProfile(profileId);

    const unprocessed = await postRepo.getUnprocessedPosts(profileId);
    logger.info(`Scheduler[${profileId}]: ${unprocessed.length} unprocessed post(s)`);
    for (const post of unprocessed) {
      try {
        await pipelineWorker.processPost(post.id);
      } catch (err) {
        logger.error(`Scheduler: failed to process post ${post.id}`, { error: err });
        // The daily report should continue even if one post fails.
      }
    }

    await jobRepo.finishSchedulerRun(run.id, 'completed');
  } catch (err) {
    await jobRepo.finishSchedulerRun(run.id, 'failed');
    logger.error(`Scheduler: profile ${profileId} failed`, { error: err });
  } finally {
    activeProfiles.delete(profileId);
  }
}

/**
 * Run the full scan across all monitored profiles, respecting concurrency.
 * Called both by the cron job and by POST /api/scheduler/run.
 */
export async function runProfileScan(): Promise<{ processed: number; skipped: number }> {
  const profiles = await profileRepo.findAllMonitored();
  logger.info(`Scheduler[scan]: ${profiles.length} profile(s), concurrency=${CONCURRENCY}`);

  let processed = 0;
  let skipped   = 0;
  const queue   = [...profiles];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const profile = queue.shift()!;
      if (activeProfiles.has(profile.id)) { skipped++; continue; }
      await processProfile(profile.id);
      processed++;
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, Math.max(profiles.length, 1)) }, worker);
  await Promise.all(workers);
  return { processed, skipped };
}

// ─── Scheduler bootstrap ──────────────────────────────────────────────────────
export function initScheduler(): void {
  const scheduler = Scheduler.getInstance();
  const cron      = schedulerCfg.profiles.scrapeIntervalCron;

  scheduler.schedule('scrape-profiles', cron, async () => {
    const { processed, skipped } = await runProfileScan();
    logger.info(`Scheduler[tick]: processed=${processed} skipped=${skipped}`);
  });

  scheduler.schedule('health-heartbeat', '*/5 * * * *', async () => {
    logger.debug('Scheduler[health-heartbeat]: alive');
  });

  logger.info(`Scheduler: ${scheduler.listJobs().length} job(s) registered [cron=${cron} concurrency=${CONCURRENCY}]`);
}

// Export singletons required by server.ts
export { pipelineWorker, profileRepo, postRepo, notifications, reportRepo, scraper, telegram };
