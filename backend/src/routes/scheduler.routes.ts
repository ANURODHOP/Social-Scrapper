// src/routes/scheduler.routes.ts
import { Router, Request, Response } from 'express';
import { Scheduler } from '../scheduler';
import { JobRepository } from '../repositories/job.repository';
import { ok, fail } from '../types';
import logger from '../logger';

const router  = Router();
const jobRepo = new JobRepository();

// GET /api/scheduler/status
router.get('/status', (_req: Request, res: Response): void => {
  try {
    const jobs = Scheduler.getInstance().listJobs();
    res.json(ok({ activeCronJobs: jobs }));
  } catch (err) {
    logger.error('GET /scheduler/status', { error: err });
    res.status(500).json(fail('Failed to get scheduler status'));
  }
});

// GET /api/scheduler/runs
router.get('/runs', async (_req: Request, res: Response): Promise<void> => {
  try {
    const runs = await jobRepo.findSchedulerRuns(20);
    res.json(ok(runs));
  } catch (err) {
    logger.error('GET /scheduler/runs', { error: err });
    res.status(500).json(fail('Failed to fetch scheduler runs'));
  }
});

// A mutable ref for the real handler injected from server.ts
export const dynamicHandlers = {
  runProfileScan: null as (() => Promise<unknown>) | null
};

// POST /api/scheduler/run
router.post('/run', async (_req: Request, res: Response): Promise<void> => {
  if (!dynamicHandlers.runProfileScan) {
    logger.warn('POST /scheduler/run called before scheduler was initialised');
    res.status(503).json(fail('Scheduler not yet initialised — retry in a moment'));
    return;
  }
  try {
    const result = await dynamicHandlers.runProfileScan();
    res.json(ok(result));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error('POST /scheduler/run', { error: message });
    res.status(500).json(fail(message));
  }
});

export default router;
