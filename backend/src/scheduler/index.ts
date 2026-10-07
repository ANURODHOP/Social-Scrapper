// src/scheduler/index.ts
// Full scheduler bootstrap.
// IMPORTANT: All service singletons are created lazily inside initScheduler()
// so that importing this module (e.g. from scheduler.routes.ts) does NOT
// instantiate Playwright, Telegram, or any heavy dependency at module-load time.
// This allows the Express server to boot on serverless environments (Vercel)
// where browser binaries are unavailable.

import { Scheduler } from './scheduler';
import { Config }    from '../config';
import logger from '../logger';

export { Scheduler };

// ─── Lazy singletons (populated once by initScheduler / wireDynamicHandlers) ──
let _pipelineWorker:  any = null;
let _profileRepo:     any = null;
let _postRepo:        any = null;
let _notifications:   any = null;
let _reportRepo:      any = null;
let _scraper:         any = null;
let _telegram:        any = null;
let _telegramChatId:  string = '';

export function getPipelineWorker() { return _pipelineWorker; }
export function getProfileRepo()    { return _profileRepo; }
export function getPostRepo()       { return _postRepo; }
export function getNotifications()  { return _notifications; }
export function getReportRepo()     { return _reportRepo; }
export function getScraper()        { return _scraper; }
export function getTelegram()       { return _telegram; }
export function getTelegramChatId() { return _telegramChatId; }

// Named exports expected by server.ts wireDynamicHandlers (populated after init)
export let pipelineWorker: any  = null;
export let profileRepo:    any  = null;
export let postRepo:       any  = null;
export let notifications:  any  = null;
export let reportRepo:     any  = null;
export let scraper:        any  = null;
export let telegram:       any  = null;
export let telegramChatId: string = '';

let _initialized = false;

// ─── Concurrency control ──────────────────────────────────────────────────────
const activeProfiles = new Set<string>();

async function processProfile(profileId: string): Promise<void> {
  if (activeProfiles.has(profileId)) {
    logger.warn(`Scheduler: profile ${profileId} already in progress — skipping`);
    return;
  }
  activeProfiles.add(profileId);
  const jobRepo: any = (global as any).__schedulerJobRepo;
  const runRecord = await jobRepo.createSchedulerRun(`process-profile:${profileId}`);

  try {
    await _scraper.scrapeProfile(profileId);

    const unprocessed = await _postRepo.getUnprocessedPosts(profileId);
    logger.info(`Scheduler[${profileId}]: ${unprocessed.length} unprocessed post(s)`);
    for (const post of unprocessed) {
      try {
        await _pipelineWorker.processPost(post.id);
      } catch (err) {
        logger.error(`Scheduler: failed to process post ${post.id}`, { error: err });
      }
    }

    await jobRepo.finishSchedulerRun(runRecord.id, 'completed');
  } catch (err) {
    await jobRepo.finishSchedulerRun(runRecord.id, 'failed');
    logger.error(`Scheduler: profile ${profileId} failed`, { error: err });
  } finally {
    activeProfiles.delete(profileId);
  }
}

export async function runProfileScan(): Promise<{ processed: number; skipped: number }> {
  if (!_initialized) throw new Error('Scheduler not initialized');
  const profiles = await _profileRepo.findAllMonitored();
  const cfg = Config.getInstance();
  const CONCURRENCY = cfg.get('scheduler').concurrency ?? 2;
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

/**
 * initScheduler — called ONCE from server.ts wireDynamicHandlers()
 * after all heavy dependencies have been dynamically imported.
 * Receives all pre-built singletons so this file never imports them statically.
 */
export function initScheduler(deps: {
  pipelineWorker:  any;
  profileRepo:     any;
  postRepo:        any;
  notifications:   any;
  reportRepo:      any;
  scraper:         any;
  telegram:        any;
  jobRepo:         any;
  telegramChatId:  string;
}): void {
  if (_initialized) {
    logger.warn('initScheduler: already initialized, skipping');
    return;
  }

  // Populate module-level exports so server.ts destructuring still works
  _pipelineWorker = pipelineWorker = deps.pipelineWorker;
  _profileRepo    = profileRepo    = deps.profileRepo;
  _postRepo       = postRepo       = deps.postRepo;
  _notifications  = notifications  = deps.notifications;
  _reportRepo     = reportRepo     = deps.reportRepo;
  _scraper        = scraper        = deps.scraper;
  _telegram       = telegram       = deps.telegram;
  _telegramChatId = telegramChatId = deps.telegramChatId;

  // Store jobRepo in global for processProfile helper
  (global as any).__schedulerJobRepo = deps.jobRepo;

  _initialized = true;

  const cfg           = Config.getInstance();
  const schedulerCfg  = cfg.get('scheduler');
  const cron          = schedulerCfg.profiles.scrapeIntervalCron;
  const CONCURRENCY   = schedulerCfg.concurrency ?? 2;
  const scheduler     = Scheduler.getInstance();

  scheduler.schedule('scrape-profiles', cron, async () => {
    const { processed, skipped } = await runProfileScan();
    logger.info(`Scheduler[tick]: processed=${processed} skipped=${skipped}`);
  });

  scheduler.schedule('health-heartbeat', '*/5 * * * *', async () => {
    logger.debug('Scheduler[health-heartbeat]: alive');
  });

  logger.info(`Scheduler: ${scheduler.listJobs().length} job(s) registered [cron=${cron} concurrency=${CONCURRENCY}]`);
}
