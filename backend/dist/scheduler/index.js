"use strict";
// src/scheduler/index.ts
// Full scheduler bootstrap.
// IMPORTANT: All service singletons are created lazily inside initScheduler()
// so that importing this module (e.g. from scheduler.routes.ts) does NOT
// instantiate Playwright, Telegram, or any heavy dependency at module-load time.
// This allows the Express server to boot on serverless environments (Vercel)
// where browser binaries are unavailable.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.telegramChatId = exports.telegram = exports.scraper = exports.reportRepo = exports.notifications = exports.postRepo = exports.profileRepo = exports.pipelineWorker = exports.Scheduler = void 0;
exports.getPipelineWorker = getPipelineWorker;
exports.getProfileRepo = getProfileRepo;
exports.getPostRepo = getPostRepo;
exports.getNotifications = getNotifications;
exports.getReportRepo = getReportRepo;
exports.getScraper = getScraper;
exports.getTelegram = getTelegram;
exports.getTelegramChatId = getTelegramChatId;
exports.runProfileScan = runProfileScan;
exports.initScheduler = initScheduler;
const scheduler_1 = require("./scheduler");
Object.defineProperty(exports, "Scheduler", { enumerable: true, get: function () { return scheduler_1.Scheduler; } });
const config_1 = require("../config");
const logger_1 = __importDefault(require("../logger"));
// ─── Lazy singletons (populated once by initScheduler / wireDynamicHandlers) ──
let _pipelineWorker = null;
let _profileRepo = null;
let _postRepo = null;
let _notifications = null;
let _reportRepo = null;
let _scraper = null;
let _telegram = null;
let _telegramChatId = '';
function getPipelineWorker() { return _pipelineWorker; }
function getProfileRepo() { return _profileRepo; }
function getPostRepo() { return _postRepo; }
function getNotifications() { return _notifications; }
function getReportRepo() { return _reportRepo; }
function getScraper() { return _scraper; }
function getTelegram() { return _telegram; }
function getTelegramChatId() { return _telegramChatId; }
// Named exports expected by server.ts wireDynamicHandlers (populated after init)
exports.pipelineWorker = null;
exports.profileRepo = null;
exports.postRepo = null;
exports.notifications = null;
exports.reportRepo = null;
exports.scraper = null;
exports.telegram = null;
exports.telegramChatId = '';
let _initialized = false;
// ─── Concurrency control ──────────────────────────────────────────────────────
const activeProfiles = new Set();
async function processProfile(profileId) {
    if (activeProfiles.has(profileId)) {
        logger_1.default.warn(`Scheduler: profile ${profileId} already in progress — skipping`);
        return;
    }
    activeProfiles.add(profileId);
    const jobRepo = global.__schedulerJobRepo;
    const runRecord = await jobRepo.createSchedulerRun(`process-profile:${profileId}`);
    try {
        await _scraper.scrapeProfile(profileId);
        const unprocessed = await _postRepo.getUnprocessedPosts(profileId);
        logger_1.default.info(`Scheduler[${profileId}]: ${unprocessed.length} unprocessed post(s)`);
        for (const post of unprocessed) {
            try {
                await _pipelineWorker.processPost(post.id);
            }
            catch (err) {
                logger_1.default.error(`Scheduler: failed to process post ${post.id}`, { error: err });
            }
        }
        await jobRepo.finishSchedulerRun(runRecord.id, 'completed');
    }
    catch (err) {
        await jobRepo.finishSchedulerRun(runRecord.id, 'failed');
        logger_1.default.error(`Scheduler: profile ${profileId} failed`, { error: err });
    }
    finally {
        activeProfiles.delete(profileId);
    }
}
async function runProfileScan() {
    if (!_initialized)
        throw new Error('Scheduler not initialized');
    const profiles = await _profileRepo.findAllMonitored();
    const cfg = config_1.Config.getInstance();
    const CONCURRENCY = cfg.get('scheduler').concurrency ?? 2;
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
/**
 * initScheduler — called ONCE from server.ts wireDynamicHandlers()
 * after all heavy dependencies have been dynamically imported.
 * Receives all pre-built singletons so this file never imports them statically.
 */
function initScheduler(deps) {
    if (_initialized) {
        logger_1.default.warn('initScheduler: already initialized, skipping');
        return;
    }
    // Populate module-level exports so server.ts destructuring still works
    _pipelineWorker = exports.pipelineWorker = deps.pipelineWorker;
    _profileRepo = exports.profileRepo = deps.profileRepo;
    _postRepo = exports.postRepo = deps.postRepo;
    _notifications = exports.notifications = deps.notifications;
    _reportRepo = exports.reportRepo = deps.reportRepo;
    _scraper = exports.scraper = deps.scraper;
    _telegram = exports.telegram = deps.telegram;
    _telegramChatId = exports.telegramChatId = deps.telegramChatId;
    // Store jobRepo in global for processProfile helper
    global.__schedulerJobRepo = deps.jobRepo;
    _initialized = true;
    const cfg = config_1.Config.getInstance();
    const schedulerCfg = cfg.get('scheduler');
    const cron = schedulerCfg.profiles.scrapeIntervalCron;
    const CONCURRENCY = schedulerCfg.concurrency ?? 2;
    const scheduler = scheduler_1.Scheduler.getInstance();
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