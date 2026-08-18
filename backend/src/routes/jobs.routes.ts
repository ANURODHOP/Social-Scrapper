// src/routes/jobs.routes.ts
import { Router, Request, Response } from 'express';
import { JobRepository } from '../repositories/job.repository';
import { ok, fail } from '../types';
import logger from '../logger';

const router  = Router();
const jobRepo = new JobRepository();

// GET /api/jobs?status=...
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query['status'] as string | undefined;
    const jobs   = await jobRepo.findScheduledJobs(status);
    res.json(ok(jobs));
  } catch (err) {
    logger.error('GET /jobs', { error: err });
    res.status(500).json(fail('Failed to fetch jobs'));
  }
});

// GET /api/jobs/history
router.get('/history', async (req: Request, res: Response): Promise<void> => {
  try {
    const limit   = parseInt(String(req.query['limit'] ?? '50'), 10);
    const history = await jobRepo.findJobHistory(limit);
    res.json(ok(history));
  } catch (err) {
    logger.error('GET /jobs/history', { error: err });
    res.status(500).json(fail('Failed to fetch job history'));
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await jobRepo.findScheduledJobById(req.params['id']!);
    if (!job) { res.status(404).json(fail('Job not found')); return; }
    res.json(ok(job));
  } catch (err) {
    logger.error(`GET /jobs/${req.params['id']}`, { error: err });
    res.status(500).json(fail('Failed to fetch job'));
  }
});

export default router;
