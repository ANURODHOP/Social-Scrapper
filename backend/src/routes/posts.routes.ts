// src/routes/posts.routes.ts
import { Router, Request, Response } from 'express';
import { PostRepository } from '../repositories/post.repository';
import { AnalysisRepository } from '../repositories/analysis.repository';
import { ReportRepository } from '../repositories/report.repository';
import { MediaRepository } from '../repositories/media.repository';
import { ok, fail } from '../types';
import logger from '../logger';

const router       = Router();
const postRepo     = new PostRepository();
const mediaRepo    = new MediaRepository();
const analysisRepo = new AnalysisRepository();
const reportRepo   = new ReportRepository();

// GET /api/posts?profileId=...&platform=...&mediaType=...&isProcessed=...&limit=50
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { profileId, platform, mediaType, isProcessed, limit } = req.query as Record<string, string>;

    // Start with all non-deleted posts, then filter
    let posts = await postRepo.findAll(Math.min(parseInt(limit ?? '50', 10), 200));

    if (profileId)  posts = posts.filter(p => p.profileId === profileId);
    if (platform)   posts = posts.filter(p => p.platform  === platform);
    if (mediaType)  posts = posts.filter(p => p.mediaType === mediaType);
    if (isProcessed !== undefined && isProcessed !== '') {
      const flag = isProcessed === 'true';
      posts = posts.filter(p => p.isProcessed === flag);
    }

    res.json(ok(posts));
  } catch (err) {
    logger.error('GET /posts', { error: err });
    res.status(500).json(fail('Failed to fetch posts'));
  }
});

// GET /api/posts/:id  (full detail with media, analysis, reports)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id   = req.params['id']!;
    const post = await postRepo.findById(id);
    if (!post) { res.status(404).json(fail('Post not found')); return; }

    const [media, analysis, reports] = await Promise.all([
      mediaRepo.getMediaForPost(id),
      analysisRepo.findByPostId(id),
      reportRepo.findByPostId(id),
    ]);

    res.json(ok({ ...post, media, analysis, reports }));
  } catch (err) {
    logger.error(`GET /posts/${req.params['id']}`, { error: err });
    res.status(500).json(fail('Failed to fetch post'));
  }
});

// GET /api/posts/:id/media
router.get('/:id/media', async (req: Request, res: Response): Promise<void> => {
  try {
    const media = await mediaRepo.getMediaForPost(req.params['id']!);
    res.json(ok(media));
  } catch (err) {
    logger.error(`GET /posts/${req.params['id']}/media`, { error: err });
    res.status(500).json(fail('Failed to fetch media'));
  }
});

// DELETE /api/posts/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await postRepo.softDelete(req.params['id']!);
    res.json(ok({ deleted: true }));
  } catch (err) {
    logger.error(`DELETE /posts/${req.params['id']}`, { error: err });
    res.status(500).json(fail('Failed to delete post'));
  }
});

export default router;
