// src/routes/media.routes.ts
import { Router, Request, Response } from 'express';
import { MediaRepository } from '../repositories/media.repository';
import { ok, fail } from '../types';
import logger from '../logger';

const router    = Router();
const mediaRepo = new MediaRepository();

// GET /api/media/post/:postId
router.get('/post/:postId', async (req: Request, res: Response) => {
  try {
    const media = await mediaRepo.getMediaForPost(req.params['postId']!);
    res.json(ok(media));
  } catch (err) {
    logger.error(`GET /media/post/${req.params['postId']}`, { error: err });
    res.status(500).json(fail('Failed to fetch media'));
  }
});

export default router;
