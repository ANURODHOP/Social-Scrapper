"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/dashboard.routes.ts
// Dashboard summary endpoint — aggregates stats from all repositories.
const express_1 = require("express");
const types_1 = require("../types");
const firebase_1 = require("../firebase");
const scheduler_1 = require("../scheduler");
const logger_1 = __importDefault(require("../logger"));
const router = (0, express_1.Router)();
// GET /api/dashboard
router.get('/', async (_req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const [profileSnap, postSnap, reportSnap, postsTodaySnap, reelsTodaySnap, recentPostsSnap, recentReportsSnap, schedulerRunsSnap, telegramNotifsSnap,] = await Promise.all([
            firebase_1.db.collection('profiles').where('deletedAt', '==', null).where('isActive', '==', true).count().get(),
            firebase_1.db.collection('posts').where('deletedAt', '==', null).count().get(),
            firebase_1.db.collection('reports').count().get(),
            firebase_1.db.collection('posts').where('deletedAt', '==', null).where('createdAt', '>=', today).count().get(),
            firebase_1.db.collection('posts').where('deletedAt', '==', null).where('createdAt', '>=', today).where('mediaType', 'in', ['VIDEO', 'REEL']).count().get(),
            firebase_1.db.collection('posts').where('deletedAt', '==', null).orderBy('publishedAt', 'desc').limit(5).get(),
            firebase_1.db.collection('reports').orderBy('generatedAt', 'desc').limit(5).get(),
            firebase_1.db.collection('schedulerRuns').orderBy('startedAt', 'desc').limit(5).get(),
            firebase_1.db.collection('notificationHistory').where('provider', '==', 'telegram').where('status', '==', 'sent').count().get(),
        ]);
        let schedulerStatus = { activeCronJobs: [] };
        try {
            schedulerStatus = { activeCronJobs: scheduler_1.Scheduler.getInstance().listJobs() };
        }
        catch { /* scheduler may not be initialized yet */ }
        const schedulerRuns = schedulerRunsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const lastRun = schedulerRuns[0] ?? null;
        const nextRunMs = lastRun ? (new Date(lastRun.startedAt?.toDate?.() ?? lastRun.startedAt).getTime() + 24 * 60 * 60 * 1000) : null;
        res.json((0, types_1.ok)({
            stats: {
                profileCount: profileSnap.data().count,
                totalPosts: postSnap.data().count,
                totalReports: reportSnap.data().count,
                postsToday: postsTodaySnap.data().count,
                reelsToday: reelsTodaySnap.data().count,
                telegramSent: telegramNotifsSnap.data().count,
            },
            scheduler: {
                isRunning: schedulerStatus.activeCronJobs.length > 0,
                lastRun: lastRun?.startedAt ?? null,
                lastRunStatus: lastRun?.status ?? null,
                nextRun: nextRunMs ? new Date(nextRunMs).toISOString() : null,
                activeCronJobs: schedulerStatus.activeCronJobs,
            },
            recentPosts: recentPostsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
            recentReports: recentReportsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
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