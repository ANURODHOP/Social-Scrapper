// src/routes/posts.routes.ts
import { Router, Request, Response } from 'express';
import { MediaRepository } from '../repositories/media.repository';
import { ok, fail } from '../types';
import prisma from '../prisma';
import logger from '../logger';

const router    = Router();
const mediaRepo = new MediaRepository();

// GET /api/posts?profileId=...&platform=...&mediaType=...&isProcessed=...&limit=50
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { profileId, platform, mediaType, isProcessed, limit } = req.query as Record<string, string>;
    const where: {
      deletedAt: null;
      profileId?: string;
      platform?: string;
      mediaType?: string;
      isProcessed?: boolean;
    } = { deletedAt: null };
    if (profileId)                       where.profileId  = profileId;
    if (platform)                        where.platform   = platform;
    if (mediaType)                       where.mediaType  = mediaType;
    if (isProcessed !== undefined && isProcessed !== '') {
      where.isProcessed = isProcessed === 'true';
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take:    Math.min(parseInt(limit ?? '50', 10), 200),
      include: { profile: { select: { username: true, platform: true, displayName: true } } },
    });
    res.json(ok(posts));
  } catch (err) {
    logger.error('GET /posts', { error: err });
    res.status(500).json(fail('Failed to fetch posts'));
  }
});


// GET /api/posts/:id  (full detail with media, analysis, reports)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await prisma.post.findUnique({
      where:   { id: req.params['id']! },
      include: {
        profile:  { select: { username: true, platform: true, displayName: true, profilePicUrl: true } },
        media:    { include: { mediaFiles: true } },
        analysis: true,
        reports:  { orderBy: { generatedAt: 'desc' }, take: 5 },
      },
    });
    if (!post) { res.status(404).json(fail('Post not found')); return; }
    res.json(ok(post));
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

export default router;
