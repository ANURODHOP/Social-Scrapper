"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// src/server.ts
// Main application entry point.
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const logger_1 = __importDefault(require("./logger"));
const profiles_routes_1 = __importStar(require("./routes/profiles.routes"));
const posts_routes_1 = __importDefault(require("./routes/posts.routes"));
const analysis_routes_1 = __importDefault(require("./routes/analysis.routes"));
const reports_routes_1 = __importStar(require("./routes/reports.routes"));
const media_routes_1 = __importDefault(require("./routes/media.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const scheduler_routes_1 = __importStar(require("./routes/scheduler.routes"));
const jobs_routes_1 = __importDefault(require("./routes/jobs.routes"));
const logs_routes_1 = __importDefault(require("./routes/logs.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const app = (0, express_1.default)();
exports.app = app;
const config = config_1.Config.getInstance();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (config.get('port') ?? 8000);
const NODE_ENV = config.get('nodeEnv');
app.use((0, helmet_1.default)());
// ── CORS ────────────────────────────────────────────────────────────────────
// Build an explicit origin allowlist so CORS never fails due to a missing
// FRONTEND_URL env-var or a trailing-slash mismatch.
const ALLOWED_ORIGINS = new Set([
    'http://localhost:3000',
    'https://social-scrapper-wa4g.vercel.app', // production frontend (hardcoded fallback)
]);
if (process.env['FRONTEND_URL']) {
    // Also add whatever is set in the env, trimming any trailing slash.
    ALLOWED_ORIGINS.add(process.env['FRONTEND_URL'].replace(/\/$/, ''));
}
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow server-to-server / curl (no Origin header) and allowlisted origins.
        if (!origin || ALLOWED_ORIGINS.has(origin))
            return callback(null, true);
        callback(new Error(`CORS: origin not allowed — ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204, // Some legacy browsers choke on 204
}));
// Explicitly handle preflight for every route so Express never redirects OPTIONS.
app.options('*', (0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.has(origin))
            return callback(null, true);
        callback(new Error(`CORS: origin not allowed — ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, _res, next) => {
    logger_1.default.debug(`${req.method} ${req.url}`);
    next();
});
app.get('/', (_req, res) => {
    res.json({
        name: 'Social Intelligence Platform API',
        version: '1.0.0',
        environment: NODE_ENV,
        endpoints: [
            '/api/profiles', '/api/posts', '/api/analysis',
            '/api/reports', '/api/media', '/api/jobs',
            '/api/logs', '/api/settings', '/api/scheduler',
        ],
    });
});
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});
// Mount routers
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/profiles', profiles_routes_1.default);
app.use('/api/posts', posts_routes_1.default);
app.use('/api/analysis', analysis_routes_1.default);
app.use('/api/reports', reports_routes_1.default);
app.use('/api/media', media_routes_1.default);
app.use('/api/settings', settings_routes_1.default);
app.use('/api/scheduler', scheduler_routes_1.default);
app.use('/api/jobs', jobs_routes_1.default);
app.use('/api/logs', logs_routes_1.default);
// Wire dynamic handlers using mutable exports from route modules
function wireDynamicHandlers() {
    setImmediate(async () => {
        try {
            // ── Dynamic imports of heavy modules (Playwright, etc.) ─────────────────
            // These are deliberately NOT static imports so the Express app can boot
            // cleanly even on serverless environments where these may not be available.
            const { initScheduler, runProfileScan, Scheduler: _Sched } = await Promise.resolve().then(() => __importStar(require('./scheduler')));
            const { ProfileRepository } = await Promise.resolve().then(() => __importStar(require('./repositories/profile.repository')));
            const { PostRepository } = await Promise.resolve().then(() => __importStar(require('./repositories/post.repository')));
            const { MediaRepository } = await Promise.resolve().then(() => __importStar(require('./repositories/media.repository')));
            const { AnalysisRepository } = await Promise.resolve().then(() => __importStar(require('./repositories/analysis.repository')));
            const { ReportRepository } = await Promise.resolve().then(() => __importStar(require('./repositories/report.repository')));
            const { JobRepository } = await Promise.resolve().then(() => __importStar(require('./repositories/job.repository')));
            const { PipelineWorker } = await Promise.resolve().then(() => __importStar(require('./workers/pipeline.worker')));
            const { ScraperService } = await Promise.resolve().then(() => __importStar(require('./services/scraper.service')));
            const { InMemoryJobQueue } = await Promise.resolve().then(() => __importStar(require('./jobs/InMemoryJobQueue')));
            const { FirebaseStorageProvider } = await Promise.resolve().then(() => __importStar(require('./providers/storage/firebase')));
            const { FrameSamplerService } = await Promise.resolve().then(() => __importStar(require('./services/frame.sampler.service')));
            const { ReportGenerator } = await Promise.resolve().then(() => __importStar(require('./services/report/ReportGenerator')));
            const { NotificationService } = await Promise.resolve().then(() => __importStar(require('./services/notification.service')));
            const { TelegramProvider } = await Promise.resolve().then(() => __importStar(require('./providers/notification/telegram')));
            const { InstagramProvider } = await Promise.resolve().then(() => __importStar(require('./providers/social/instagram')));
            const { InstagramHTTPClient } = await Promise.resolve().then(() => __importStar(require('./providers/social/instagram.http.client')));
            // ── Build service singletons ─────────────────────────────────────────────
            const cfg = config;
            const notifCfg = cfg.get('notifications');
            const frameCfg = cfg.get('frameSampling');
            const storage = new FirebaseStorageProvider();
            const frameSampler = new FrameSamplerService(frameCfg);
            const reportGenerator = new ReportGenerator();
            const telegram = new TelegramProvider(notifCfg.telegram.botToken, notifCfg.telegram.chatId);
            const notifications = new NotificationService(telegram);
            const telegramChatId = notifCfg.telegram.chatId;
            const profileRepo = new ProfileRepository();
            const postRepo = new PostRepository();
            const mediaRepo = new MediaRepository();
            const analysisRepo = new AnalysisRepository();
            const reportRepo = new ReportRepository();
            const jobRepo = new JobRepository();
            const pipelineWorker = new PipelineWorker(storage, frameSampler, reportGenerator, notifications, postRepo, mediaRepo, analysisRepo, reportRepo, profileRepo, telegramChatId);
            const scraperTimeout = cfg.get('scraper').timeout;
            const igClient = new InstagramHTTPClient(scraperTimeout);
            const igProvider = new InstagramProvider(igClient);
            const jobQueue = new InMemoryJobQueue();
            const scraper = new ScraperService(igProvider, storage, profileRepo, postRepo, mediaRepo, jobQueue);
            // ── Health check Telegram ────────────────────────────────────────────────
            try {
                await telegram.checkHealth();
            }
            catch (err) {
                logger_1.default.error('Telegram health check failed during startup', { error: err });
            }
            // ── Wire route dynamic handlers ──────────────────────────────────────────
            scheduler_routes_1.dynamicHandlers.runProfileScan = async () => {
                logger_1.default.info('POST /scheduler/run: manual trigger via wired handler');
                return runProfileScan();
            };
            profiles_routes_1.dynamicHandlers.processProfile = async (profileId) => {
                const profile = await profileRepo.findById(profileId);
                if (!profile)
                    throw new Error('Profile not found');
                const unprocessed = await postRepo.getUnprocessedPosts(profileId);
                const results = [];
                for (const post of unprocessed) {
                    try {
                        await pipelineWorker.processPost(post.id);
                        results.push({ postId: post.id, ok: true });
                    }
                    catch (err) {
                        results.push({ postId: post.id, ok: false, error: err instanceof Error ? err.message : String(err) });
                    }
                }
                return { profileId, results };
            };
            profiles_routes_1.dynamicHandlers.scanProfile = async (profileId) => {
                const profile = await profileRepo.findById(profileId);
                if (!profile)
                    throw new Error('Profile not found');
                logger_1.default.info(`Manual scan: profile ${profileId} (${profile.username})`);
                await scraper.scrapeProfile(profileId);
                const unprocessed = await postRepo.getUnprocessedPosts(profileId);
                const results = [];
                for (const post of unprocessed) {
                    try {
                        await pipelineWorker.processPost(post.id);
                        results.push({ postId: post.id, ok: true });
                    }
                    catch (err) {
                        results.push({ postId: post.id, ok: false, error: err instanceof Error ? err.message : String(err) });
                    }
                }
                return { profileId, scraped: true, processed: results.length, results };
            };
            reports_routes_1.dynamicHandlers.sendReport = async (reportId) => {
                const report = await reportRepo.findById(reportId);
                if (!report)
                    throw new Error('Report not found');
                let documentPath;
                if (report.filePath) {
                    const isCloudUrl = report.filePath.startsWith('http://') || report.filePath.startsWith('https://');
                    if (!isCloudUrl) {
                        const pathMod = await Promise.resolve().then(() => __importStar(require('path')));
                        const htmlRelPath = report.filePath.replace('.md', '.html');
                        const candidatePath = pathMod.join(process.cwd(), 'storage', htmlRelPath);
                        const fsMod = await Promise.resolve().then(() => __importStar(require('fs')));
                        if (fsMod.existsSync(candidatePath))
                            documentPath = candidatePath;
                    }
                }
                const { latencyMs } = await notifications.sendReportToTelegram({
                    chatId: telegramChatId,
                    markdown: report.content,
                    postId: report.postId ?? undefined,
                    profileId: report.profileId ?? undefined,
                    documentPath: documentPath,
                });
                return { sent: true, latencyMs };
            };
            // ── Start scheduler (injects all deps, no top-level instantiation) ───────
            initScheduler({
                pipelineWorker, profileRepo, postRepo, notifications,
                reportRepo, scraper, telegram, jobRepo, telegramChatId,
            });
            logger_1.default.info('✅ Dynamic handlers wired. Scheduler started.');
        }
        catch (err) {
            logger_1.default.error('wireDynamicHandlers: failed — pipeline endpoints will return 503', { error: err });
        }
    });
}
app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Not Found' });
});
app.use((err, _req, res, _next) => {
    logger_1.default.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({
        success: false,
        error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
});
const server = app.listen(PORT, '0.0.0.0', () => {
    logger_1.default.info(`🚀 Server running on http://0.0.0.0:${PORT} [${NODE_ENV}]`);
    wireDynamicHandlers();
});
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM — shutting down');
    server.close(() => { logger_1.default.info('Server closed'); process.exit(0); });
});
process.on('SIGINT', () => {
    logger_1.default.info('SIGINT — shutting down');
    server.close(() => { logger_1.default.info('Server closed'); process.exit(0); });
});
//# sourceMappingURL=server.js.map