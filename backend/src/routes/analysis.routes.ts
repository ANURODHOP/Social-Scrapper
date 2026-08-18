// src/routes/analysis.routes.ts
import { Router, Request, Response } from 'express';
import { AnalysisRepository } from '../repositories/analysis.repository';
import { ok, fail } from '../types';
import logger from '../logger';

const router       = Router();
const analysisRepo = new AnalysisRepository();

// GET /api/analysis/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const analysis = await analysisRepo.findById(req.params['id']!);
    if (!analysis) { res.status(404).json(fail('Analysis not found')); return; }
    res.json(ok(analysis));
  } catch (err) {
    logger.error(`GET /analysis/${req.params['id']}`, { error: err });
    res.status(500).json(fail('Failed to fetch analysis'));
  }
});

// GET /api/analysis/post/:postId
router.get('/post/:postId', async (req: Request, res: Response): Promise<void> => {
  try {
    const analysis = await analysisRepo.findByPostId(req.params['postId']!);
    if (!analysis) { res.status(404).json(fail('Analysis not found for this post')); return; }
    res.json(ok(analysis));
  } catch (err) {
    logger.error(`GET /analysis/post/${req.params['postId']}`, { error: err });
    res.status(500).json(fail('Failed to fetch analysis'));
  }
});

// POST /api/analysis/:id/retry
router.post('/:id/retry', async (req: Request, res: Response): Promise<void> => {
  try {
    const analysis = await analysisRepo.findById(req.params['id']!);
    if (!analysis) { res.status(404).json(fail('Analysis not found')); return; }

    await analysisRepo.deleteByPostId(analysis.postId);

    const { PostRepository } = await import('../repositories/post.repository');
    await new PostRepository().update(analysis.postId, { isProcessed: false });

    logger.info(`POST /analysis/${req.params['id']}/retry: re-queued postId=${analysis.postId}`);
    res.json(ok({ retrying: true, postId: analysis.postId }));
  } catch (err) {
    logger.error(`POST /analysis/${req.params['id']}/retry`, { error: err });
    res.status(500).json(fail('Failed to retry analysis'));
  }
});

export default router;
