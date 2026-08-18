"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/dashboard.routes.ts
// Dashboard summary endpoint — aggregates stats from all repositories.
const express_1 = require("express");
const types_1 = require("../types");
const prisma_1 = __importDefault(require("../prisma"));
const scheduler_1 = require("../scheduler");
const logger_1 = __importDefault(require("../logger"));
const router = (0, express_1.Router)();
// GET /api/dashboard
router.get('/', async (_req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const [profileCount, totalPosts, totalReports, postsToday, reelsToday, recentPosts, recentReports, schedulerRuns, telegramNotifs,] = await Promise.all([
            prisma_1.default.profile.count({ where: { deletedAt: null, isActive: true } }),
            prisma_1.default.post.count({ where: { deletedAt: null } }),
            prisma_1.default.report.count({ where: { deletedAt: null } }),
            prisma_1.default.post.count({ where: { deletedAt: null, createdAt: { gte: today } } }),
            prisma_1.default.post.count({ where: { deletedAt: null, createdAt: { gte: today }, mediaType: { in: ['VIDEO', 'REEL'] } } }),
            prisma_1.default.post.findMany({
                where: { deletedAt: null },
                orderBy: { publishedAt: 'desc' },
                take: 5,
                include: { profile: { select: { username: true, platform: true } } },
            }),
            prisma_1.default.report.findMany({
                where: { deletedAt: null },
                orderBy: { generatedAt: 'desc' },
                take: 5,
            }),
            prisma_1.default.schedulerRun.findMany({
                orderBy: { startedAt: 'desc' },
                take: 5,
            }),
            prisma_1.default.notificationHistory.count({ where: { provider: 'telegram', status: 'sent' } }),
        ]);
        let schedulerStatus = { activeCronJobs: [] };
        try {
            schedulerStatus = { activeCronJobs: scheduler_1.Scheduler.getInstance().listJobs() };
        }
        catch { /* scheduler may not be initialized yet */ }
        const lastRun = schedulerRuns[0] ?? null;
        const nextRunMs = lastRun ? (new Date(lastRun.startedAt).getTime() + 24 * 60 * 60 * 1000) : null;
        res.json((0, types_1.ok)({
            stats: {
                profileCount,
                totalPosts,
                totalReports,
                postsToday,
                reelsToday,
                telegramSent: telegramNotifs,
            },
            scheduler: {
                isRunning: schedulerStatus.activeCronJobs.length > 0,
                lastRun: lastRun?.startedAt ?? null,
                lastRunStatus: lastRun?.status ?? null,
                nextRun: nextRunMs ? new Date(nextRunMs).toISOString() : null,
                activeCronJobs: schedulerStatus.activeCronJobs,
            },
            recentPosts,
            recentReports,
            recentSchedulerRuns: schedulerRuns,
        }));
    }
    catch (err) {
        logger_1.default.error('GET /dashboard', { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch dashboard data'));
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map