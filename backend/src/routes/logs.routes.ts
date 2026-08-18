// src/routes/logs.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { ok, fail } from '../types';
import logger from '../logger';

const router = Router();

// GET /api/logs?level=error&limit=100
router.get('/', async (req: Request, res: Response) => {
  try {
    const level = req.query['level'] as string | undefined;
    const limit = Math.min(parseInt(String(req.query['limit'] ?? '100'), 10), 500);

    const logs = await prisma.log.findMany({
      where:   level ? { level } : {},
      orderBy: { createdAt: 'desc' },
      take:    limit,
    });
    res.json(ok(logs));
  } catch (err) {
    logger.error('GET /logs', { error: err });
    res.status(500).json(fail('Failed to fetch logs'));
  }
});

export default router;
