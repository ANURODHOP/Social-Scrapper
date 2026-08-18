"use strict";
// src/scheduler/index.ts
// Full scheduler bootstrap with:
//  - Configurable concurrency (default: 2 simultaneous profiles)
//  - Active-profile Set to prevent duplicate simultaneous runs
//  - Job history persisted to DB (SchedulerRun) on every execution
//  - Scrape + pipeline cascade for each monitored profile
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.telegram = exports.scraper = exports.reportRepo = exports.notifications = exports.postRepo = exports.profileRepo = exports.pipelineWorker = exports.telegramChatId = exports.Scheduler = void 0;
exports.runProfileScan = runProfileScan;
exports.initScheduler = initScheduler;
const scheduler_1 = require("./scheduler");
Object.defineProperty(exports, "Scheduler", { enumerable: true, get: function () { return scheduler_1.Scheduler; } });
const config_1 = require("../config");
const profile_repository_1 = require("../repositories/profile.repository");
const post_repository_1 = require("../repositories/post.repository");
const media_repository_1 = require("../repositories/media.repository");
const analysis_repository_1 = require("../repositories/analysis.repository");
const report_repository_1 = require("../repositories/report.repository");
const job_repository_1 = require("../repositories/job.repository");
const pipeline_worker_1 = require("../workers/pipeline.worker");
const scraper_service_1 = require("../services/scraper.service");
const InMemoryJobQueue_1 = require("../jobs/InMemoryJobQueue");
const local_1 = require("../providers/storage/local");
const frame_sampler_service_1 = require("../services/frame.sampler.service");
const ReportGenerator_1 = require("../services/report/ReportGenerator");
const notification_service_1 = require("../services/notification.service");
const telegram_1 = require("../providers/notification/telegram");
const instagram_1 = require("../providers/social/instagram");
const instagram_http_client_1 = require("../providers/social/instagram.http.client");
const prisma_1 = __importDefault(require("../prisma"));
const logger_1 = __importDefault(require("../logger"));
// ─── Shared service singletons ────────────────────────────────────────────────
const cfg = config_1.Config.getInstance();
const notifCfg = cfg.get('notifications');
const storageCfg = cfg.get('storage');
const frameCfg = cfg.get('frameSampling');
const schedulerCfg = cfg.get('scheduler');
const storage = new local_1.LocalStorageProvider(storageCfg.local?.rootPath);
const frameSampler = new frame_sampler_service_1.FrameSamplerService(frameCfg);
const reportGenerator = new ReportGenerator_1.ReportGenerator();
const telegram = new telegram_1.TelegramProvider(notifCfg.telegram.botToken, notifCfg.telegram.chatId);
exports.telegram = telegram;
const notifications = new notification_service_1.NotificationService(telegram);
exports.notifications = notifications;
const profileRepo = new profile_repository_1.ProfileRepository();
exports.profileRepo = profileRepo;
const postRepo = new post_repository_1.PostRepository();
exports.postRepo = postRepo;
const mediaRepo = new media_repository_1.MediaRepository();
const analysisRepo = new analysis_repository_1.AnalysisRepository();
const reportRepo = new report_repository_1.ReportRepository();
exports.reportRepo = reportRepo;
const jobRepo = new job_repository_1.JobRepository();
const pipelineWorker = new pipeline_worker_1.PipelineWorker(storage, frameSampler, reportGenerator, notifications, postRepo, mediaRepo, analysisRepo, reportRepo, profileRepo, notifCfg.telegram.chatId);
exports.pipelineWorker = pipelineWorker;
const igClient = new instagram_http_client_1.InstagramHTTPClient(cfg.get('scraper').timeout);
const igProvider = new instagram_1.InstagramProvider(igClient);
const jobQueue = new InMemoryJobQueue_1.InMemoryJobQueue();
const scraper = new scraper_service_1.ScraperService(igProvider, storage, prisma_1.default, jobQueue);
exports.scraper = scraper;
exports.telegramChatId = notifCfg.telegram.chatId;
// ─── Concurrency control ──────────────────────────────────────────────────────
const CONCURRENCY = schedulerCfg.concurrency ?? 2;
const activeProfiles = new Set();
async function processProfile(profileId) {
    if (activeProfiles.has(profileId)) {
        logger_1.default.warn(`Scheduler: profile ${profileId} already in progress — skipping`);
        return;
    }
    activeProfiles.add(profileId);
    const run = await jobRepo.createSchedulerRun(`process-profile:${profileId}`);
    try {
        await scraper.scrapeProfile(profileId);
        const unprocessed = await postRepo.getUnprocessedPosts(profileId);
        logger_1.default.info(`Scheduler[${profileId}]: ${unprocessed.length} unprocessed post(s)`);
        for (const post of unprocessed) {
            try {
                await pipelineWorker.processPost(post.id);
            }
            catch (err) {
                logger_1.default.error(`Scheduler: failed to process post ${post.id}`, { error: err });
                // The daily report should continue even if one post fails.
            }
        }
        await jobRepo.finishSchedulerRun(run.id, 'completed');
    }
    catch (err) {
        await jobRepo.finishSchedulerRun(run.id, 'failed');
        logger_1.default.error(`Scheduler: profile ${profileId} failed`, { error: err });
    }
    finally {
        activeProfiles.delete(profileId);
    }
}
/**
 * Run the full scan across all monitored profiles, respecting concurrency.
 * Called both by the cron job and by POST /api/scheduler/run.
 */
async function runProfileScan() {
    const profiles = await profileRepo.findAllMonitored();
    logger_1.default.info(`Scheduler[scan]: ${profiles.length} profile(s), concurrency=${CONCURRENCY}`);
    let processed = 0;
    let skipped = 0;
    const queue = [...profiles];
    async function worker() {
        while (queue.length > 0) {
            const profile = queue.shift();
            if (activeProfiles.has(profile.id)) {
                skipped++;
                continue;
            }
            await processProfile(profile.id);
            processed++;
        }
    }
    const workers = Array.from({ length: Math.min(CONCURRENCY, Math.max(profiles.length, 1)) }, worker);
    await Promise.all(workers);
    return { processed, skipped };
}
// ─── Scheduler bootstrap ──────────────────────────────────────────────────────
function initScheduler() {
    const scheduler = scheduler_1.Scheduler.getInstance();
    const cron = schedulerCfg.profiles.scrapeIntervalCron;
    scheduler.schedule('scrape-profiles', cron, async () => {
        const { processed, skipped } = await runProfileScan();
        logger_1.default.info(`Scheduler[tick]: processed=${processed} skipped=${skipped}`);
    });
    scheduler.schedule('health-heartbeat', '*/5 * * * *', async () => {
        logger_1.default.debug('Scheduler[health-heartbeat]: alive');
    });
    logger_1.default.info(`Scheduler: ${scheduler.listJobs().length} job(s) registered [cron=${cron} concurrency=${CONCURRENCY}]`);
}
//# sourceMappingURL=index.js.map