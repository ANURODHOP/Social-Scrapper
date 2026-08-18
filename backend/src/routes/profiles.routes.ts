// src/routes/profiles.routes.ts
import { Router, Request, Response } from 'express';
import { ProfileRepository } from '../repositories/profile.repository';
import { ok, fail } from '../types';
import logger from '../logger';

const router = Router();
const profileRepo = new ProfileRepository();

export const dynamicHandlers = {
  processProfile: null as ((id: string) => Promise<unknown>) | null,
  scanProfile:    null as ((id: string) => Promise<unknown>) | null,
};

// GET /api/profiles
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const profiles = await profileRepo.findAll();
    res.json(ok(profiles));
  } catch (err) {
    logger.error('GET /profiles', { error: err });
    res.status(500).json(fail('Failed to fetch profiles'));
  }
});

// GET /api/profiles/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await profileRepo.findById(req.params['id']!);
    if (!profile) { res.status(404).json(fail('Profile not found')); return; }
    res.json(ok(profile));
  } catch (err) {
    logger.error(`GET /profiles/${req.params['id']}`, { error: err });
    res.status(500).json(fail('Failed to fetch profile'));
  }
});

// POST /api/profiles
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { platform, platformId, username, displayName, bio, followerCount, followingCount, profilePicUrl } = req.body as Record<string, unknown>;
  if (!platform || !platformId || !username) {
    res.status(400).json(fail('platform, platformId, and username are required'));
    return;
  }
  try {
    const profile = await profileRepo.create({
      platform:      String(platform),
      platformId:    String(platformId),
      username:      String(username),
      displayName:   displayName   ? String(displayName)   : undefined,
      bio:           bio           ? String(bio)           : undefined,
      followerCount:  typeof followerCount  === 'number' ? followerCount  : undefined,
      followingCount: typeof followingCount === 'number' ? followingCount : undefined,
      profilePicUrl: profilePicUrl ? String(profilePicUrl) : undefined,
    });
    res.status(201).json(ok(profile));
  } catch (err) {
    logger.error('POST /profiles', { error: err });
    res.status(500).json(fail('Failed to create profile'));
  }
});

// PATCH /api/profiles/:id
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await profileRepo.update(req.params['id']!, req.body as Record<string, unknown>);
    res.json(ok(profile));
  } catch (err) {
    logger.error(`PATCH /profiles/${req.params['id']}`, { error: err });
    res.status(500).json(fail('Failed to update profile'));
  }
});

// DELETE /api/profiles/:id
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await profileRepo.softDelete(req.params['id']!);
    res.json(ok({ deleted: true }));
  } catch (err) {
    logger.error(`DELETE /profiles/${req.params['id']}`, { error: err });
    res.status(500).json(fail('Failed to delete profile'));
  }
});

// POST /api/profiles/:id/process
router.post('/:id/process', async (req: Request, res: Response): Promise<void> => {
  if (!dynamicHandlers.processProfile) {
    res.status(501).json(fail('Pipeline orchestrator not yet wired'));
    return;
  }
  try {
    const result = await dynamicHandlers.processProfile(req.params['id']!);
    res.json(ok(result));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json(fail(message));
  }
});

// POST /api/profiles/:id/scan  (scrape new posts then run full pipeline)
router.post('/:id/scan', async (req: Request, res: Response): Promise<void> => {
  if (!dynamicHandlers.scanProfile) {
    res.status(503).json(fail('Scan orchestrator not yet wired — retry in a moment'));
    return;
  }
  try {
    const result = await dynamicHandlers.scanProfile(req.params['id']!);
    res.json(ok(result));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`POST /profiles/${req.params['id']}/scan`, { error: message });
    res.status(500).json(fail(message));
  }
});

export default router;
