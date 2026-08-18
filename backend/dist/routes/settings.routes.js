"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/settings.routes.ts
const express_1 = require("express");
const settings_repository_1 = require("../repositories/settings.repository");
const types_1 = require("../types");
const config_1 = require("../config");
const logger_1 = __importDefault(require("../logger"));
const router = (0, express_1.Router)();
const settingsRepo = new settings_repository_1.SettingsRepository();
const cfg = config_1.Config.getInstance();
// GET /api/settings  (returns all platform settings + resolved config for UI)
router.get('/', async (_req, res) => {
    try {
        const all = await settingsRepo.getAllSettings();
        const notif = cfg.get('notifications');
        const aiCfg = cfg.get('ai');
        const frameCfg = cfg.get('frameSampling');
        const schedCfg = cfg.get('scheduler');
        // Telegram status (token exists = configured)
        const telegramConfigured = Boolean(notif.telegram?.botToken);
        const telegramChatId = notif.telegram?.chatId ?? null;
        res.json((0, types_1.ok)({
            settings: all,
            telegram: {
                configured: telegramConfigured,
                chatId: telegramChatId,
                botId: process.env['TELEGRAM_BOT_ID'] ?? null,
            },
            ai: {
                provider: aiCfg.default,
                model: aiCfg.nvidia?.model ?? null,
                apiKeySet: Boolean(aiCfg.nvidia?.apiKey),
            },
            frameSampling: {
                maxFrames: frameCfg.maxFrames,
                shortInterval: frameCfg.shortInterval,
                mediumInterval: frameCfg.mediumInterval,
                longInterval: frameCfg.longInterval,
                shortThreshold: frameCfg.shortThreshold,
                mediumThreshold: frameCfg.mediumThreshold,
            },
            scheduler: {
                cron: schedCfg.profiles?.scrapeIntervalCron ?? '0 8 * * *',
                concurrency: schedCfg.concurrency ?? 2,
            },
        }));
    }
    catch (err) {
        logger_1.default.error('GET /settings', { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch settings'));
    }
});
// GET /api/settings/:platform/:key
router.get('/:platform/:key', async (req, res) => {
    try {
        const setting = await settingsRepo.getSetting(req.params['platform'], req.params['key']);
        if (!setting) {
            res.status(404).json((0, types_1.fail)('Setting not found'));
            return;
        }
        res.json((0, types_1.ok)(setting));
    }
    catch (err) {
        logger_1.default.error('GET /settings/:platform/:key', { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch setting'));
    }
});
// PUT /api/settings/:platform/:key
router.put('/:platform/:key', async (req, res) => {
    const { value, description } = req.body;
    if (value === undefined) {
        res.status(400).json((0, types_1.fail)('value is required'));
        return;
    }
    try {
        const setting = await settingsRepo.setSetting(req.params['platform'], req.params['key'], String(value), description);
        res.json((0, types_1.ok)(setting));
    }
    catch (err) {
        logger_1.default.error('PUT /settings/:platform/:key', { error: err });
        res.status(500).json((0, types_1.fail)('Failed to save setting'));
    }
});
exports.default = router;
//# sourceMappingURL=settings.routes.js.map