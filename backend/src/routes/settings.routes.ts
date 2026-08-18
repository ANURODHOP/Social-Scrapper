// src/routes/settings.routes.ts
import { Router, Request, Response } from 'express';
import { SettingsRepository } from '../repositories/settings.repository';
import { ok, fail } from '../types';
import { Config } from '../config';
import logger from '../logger';

const router       = Router();
const settingsRepo = new SettingsRepository();
const cfg          = Config.getInstance();

// GET /api/settings  (returns all platform settings + resolved config for UI)
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const all = await settingsRepo.getAllSettings();
    const notif    = cfg.get('notifications');
    const aiCfg    = cfg.get('ai');
    const frameCfg = cfg.get('frameSampling');
    const schedCfg = cfg.get('scheduler');

    // Telegram status (token exists = configured)
    const telegramConfigured = Boolean(notif.telegram?.botToken);
    const telegramChatId     = notif.telegram?.chatId ?? null;

    res.json(ok({
      settings: all,
      telegram: {
        configured: telegramConfigured,
        chatId:     telegramChatId,
        botId:      process.env['TELEGRAM_BOT_ID'] ?? null,
      },
      ai: {
        provider:    aiCfg.default,
        model:       aiCfg.nvidia?.model ?? null,
        apiKeySet:   Boolean(aiCfg.nvidia?.apiKey),
      },
      frameSampling: {
        maxFrames:      frameCfg.maxFrames,
        shortInterval:  frameCfg.shortInterval,
        mediumInterval: frameCfg.mediumInterval,
        longInterval:   frameCfg.longInterval,
        shortThreshold:  frameCfg.shortThreshold,
        mediumThreshold: frameCfg.mediumThreshold,
      },
      scheduler: {
        cron:        schedCfg.profiles?.scrapeIntervalCron ?? '0 8 * * *',
        concurrency: schedCfg.concurrency ?? 2,
      },
    }));
  } catch (err) {
    logger.error('GET /settings', { error: err });
    res.status(500).json(fail('Failed to fetch settings'));
  }
});

// GET /api/settings/:platform/:key
router.get('/:platform/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const setting = await settingsRepo.getSetting(req.params['platform']!, req.params['key']!);
    if (!setting) { res.status(404).json(fail('Setting not found')); return; }
    res.json(ok(setting));
  } catch (err) {
    logger.error('GET /settings/:platform/:key', { error: err });
    res.status(500).json(fail('Failed to fetch setting'));
  }
});

// PUT /api/settings/:platform/:key
router.put('/:platform/:key', async (req: Request, res: Response): Promise<void> => {
  const { value, description } = req.body as { value?: unknown; description?: string };
  if (value === undefined) { res.status(400).json(fail('value is required')); return; }
  try {
    const setting = await settingsRepo.setSetting(
      req.params['platform']!,
      req.params['key']!,
      String(value),
      description
    );
    res.json(ok(setting));
  } catch (err) {
    logger.error('PUT /settings/:platform/:key', { error: err });
    res.status(500).json(fail('Failed to save setting'));
  }
});

export default router;
