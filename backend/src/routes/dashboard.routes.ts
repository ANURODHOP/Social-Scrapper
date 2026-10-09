// src/routes/dashboard.routes.ts
// Dashboard summary endpoint — aggregates stats from all repositories.
import { Router, Request, Response } from 'express';
import { ok, fail } from '../types';
import { db } from '../firebase';
import { Scheduler } from '../scheduler';
import logger from '../logger';

const router = Router();

// GET /api/dashboard
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      profileSnap,
      postSnap,
      reportSnap,
      recentReportsSnap,
      schedulerRunsSnap,
      telegramNotifsSnap,
    ] = await Promise.all([
      db.collection('profiles').get(),
      db.collection('posts').get(),
      db.collection('reports').count().get(),
      db.collection('reports').orderBy('generatedAt', 'desc').limit(5).get(),
      db.collection('schedulerRuns').orderBy('startedAt', 'desc').limit(5).get(),
      db.collection('notificationHistory').where('provider', '==', 'telegram').where('status', '==', 'sent').count().get(),
    ]);

    const activeProfilesCount = profileSnap.docs.filter(d => {
      const data = d.data();
      return !data.deletedAt && data.isActive === true;
    }).length;

    const allPosts = postSnap.docs.map(d => ({ id: d.id, ...d.data() }) as any).filter(p => !p.deletedAt);
    const totalPostsCount = allPosts.length;
    const postsTodayCount = allPosts.filter(p => p.createdAt && (p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt)) >= today).length;
    const reelsTodayCount = allPosts.filter(p => 
      p.createdAt && 
      (p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt)) >= today && 
      ['VIDEO', 'REEL'].includes(p.mediaType)
    ).length;

    const recentPosts = [...allPosts]
      .sort((a, b) => {
        const dateA = a.publishedAt?.toDate ? a.publishedAt.toDate().getTime() : new Date(a.publishedAt).getTime();
        const dateB = b.publishedAt?.toDate ? b.publishedAt.toDate().getTime() : new Date(b.publishedAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);

    let schedulerStatus: { activeCronJobs: Array<{ name: string; expression: string }> } = { activeCronJobs: [] };
    try {
      schedulerStatus = { activeCronJobs: Scheduler.getInstance().listJobs() };
    } catch { /* scheduler may not be initialized yet */ }

    type RunData = { id: string; name?: string; status?: string; startedAt?: any; finishedAt?: any; };
    const schedulerRuns = schedulerRunsSnap.docs.map(d => ({ id: d.id, ...d.data() } as RunData));
    const lastRun  = schedulerRuns[0] ?? null;
    const nextRunMs = lastRun ? (new Date(lastRun.startedAt?.toDate?.() ?? lastRun.startedAt).getTime() + 24 * 60 * 60 * 1000) : null;

    res.json(ok({
      stats: {
        profileCount:  activeProfilesCount,
        totalPosts:    totalPostsCount,
        totalReports:  reportSnap.data().count,
        postsToday:    postsTodayCount,
        reelsToday:    reelsTodayCount,
        telegramSent:  telegramNotifsSnap.data().count,
      },
      scheduler: {
        isRunning:     schedulerStatus.activeCronJobs.length > 0,
        lastRun:       (lastRun as any)?.startedAt ?? null,
        lastRunStatus: (lastRun as any)?.status ?? null,
        nextRun:       nextRunMs ? new Date(nextRunMs).toISOString() : null,
        activeCronJobs: schedulerStatus.activeCronJobs,
      },
      recentPosts,
      recentReports:       recentReportsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      recentSchedulerRuns: schedulerRuns,
    }));
  } catch (err) {
    logger.error('GET /dashboard', { error: err });
    res.status(500).json(fail('Failed to fetch dashboard data'));
  }
});

export default router;
