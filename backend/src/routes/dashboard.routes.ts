// src/routes/dashboard.routes.ts
// Dashboard summary endpoint — aggregates stats from all repositories.
import { Router, Request, Response } from 'express';
import { ok, fail } from '../types';
import prisma from '../prisma';
import { Scheduler } from '../scheduler';
import logger from '../logger';

const router = Router();

// GET /api/dashboard
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      profileCount,
      totalPosts,
      totalReports,
      postsToday,
      reelsToday,
      recentPosts,
      recentReports,
      schedulerRuns,
      telegramNotifs,
    ] = await Promise.all([
      prisma.profile.count({ where: { deletedAt: null, isActive: true } }),
      prisma.post.count({ where: { deletedAt: null } }),
      prisma.report.count({ where: { deletedAt: null } }),
      prisma.post.count({ where: { deletedAt: null, createdAt: { gte: today } } }),
      prisma.post.count({ where: { deletedAt: null, createdAt: { gte: today }, mediaType: { in: ['VIDEO', 'REEL'] } } }),
      prisma.post.findMany({
        where:   { deletedAt: null },
        orderBy: { publishedAt: 'desc' },
        take:    5,
        include: { profile: { select: { username: true, platform: true } } },
      }),
      prisma.report.findMany({
        where:   { deletedAt: null },
        orderBy: { generatedAt: 'desc' },
        take:    5,
      }),
      prisma.schedulerRun.findMany({
        orderBy: { startedAt: 'desc' },
        take:    5,
      }),
      prisma.notificationHistory.count({ where: { provider: 'telegram', status: 'sent' } }),
    ]);

    let schedulerStatus: { activeCronJobs: Array<{ name: string; expression: string }> } = { activeCronJobs: [] };
    try {
      schedulerStatus = { activeCronJobs: Scheduler.getInstance().listJobs() };
    } catch { /* scheduler may not be initialized yet */ }

    const lastRun  = schedulerRuns[0] ?? null;
    const nextRunMs = lastRun ? (new Date(lastRun.startedAt).getTime() + 24 * 60 * 60 * 1000) : null;

    res.json(ok({
      stats: {
        profileCount,
        totalPosts,
        totalReports,
        postsToday,
        reelsToday,
        telegramSent: telegramNotifs,
      },
      scheduler: {
        isRunning:    schedulerStatus.activeCronJobs.length > 0,
        lastRun:      lastRun?.startedAt ?? null,
        lastRunStatus: lastRun?.status ?? null,
        nextRun:      nextRunMs ? new Date(nextRunMs).toISOString() : null,
        activeCronJobs: schedulerStatus.activeCronJobs,
      },
      recentPosts,
      recentReports,
      recentSchedulerRuns: schedulerRuns,
    }));
  } catch (err) {
    logger.error('GET /dashboard', { error: err });
    res.status(500).json(fail('Failed to fetch dashboard data'));
  }
});

export default router;
