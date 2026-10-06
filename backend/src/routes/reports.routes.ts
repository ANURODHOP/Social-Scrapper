// src/routes/reports.routes.ts
import { Router, Request, Response } from 'express';
import { ReportRepository } from '../repositories/report.repository';
import { ok, fail } from '../types';
import logger from '../logger';

const router     = Router();
const reportRepo = new ReportRepository();

export const dynamicHandlers = {
  sendReport: null as ((id: string) => Promise<unknown>) | null
};

// GET /api/reports?postId=...&profileId=...&limit=...
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId, profileId, limit } = req.query as Record<string, string>;
    const limitCount = Math.min(parseInt(limit ?? '50', 10), 200);

    let reports;
    if (postId)    reports = await reportRepo.findByPostId(postId);
    else if (profileId) reports = await reportRepo.findByProfileId(profileId);
    else reports = await reportRepo.findAll(limitCount);

    res.json(ok(reports));
  } catch (err) {
    logger.error('GET /reports', { error: err });
    res.status(500).json(fail('Failed to fetch reports'));
  }
});

// GET /api/reports/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const report = await reportRepo.findById(req.params['id']!);
    if (!report) { res.status(404).json(fail('Report not found')); return; }
    res.json(ok(report));
  } catch (err) {
    logger.error(`GET /reports/${req.params['id']}`, { error: err });
    res.status(500).json(fail('Failed to fetch report'));
  }
});

// POST /api/reports/:id/send
router.post('/:id/send', async (req: Request, res: Response): Promise<void> => {
  if (!dynamicHandlers.sendReport) {
    res.status(501).json(fail('Notification service not yet wired'));
    return;
  }
  try {
    const result = await dynamicHandlers.sendReport(req.params['id']!);
    res.json(ok(result));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`POST /reports/${req.params['id']}/send`, { error: message });
    res.status(500).json(fail(message));
  }
});

export default router;
