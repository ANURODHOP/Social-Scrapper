"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/posts.routes.ts
const express_1 = require("express");
const media_repository_1 = require("../repositories/media.repository");
const types_1 = require("../types");
const prisma_1 = __importDefault(require("../prisma"));
const logger_1 = __importDefault(require("../logger"));
const router = (0, express_1.Router)();
const mediaRepo = new media_repository_1.MediaRepository();
// GET /api/posts?profileId=...&platform=...&mediaType=...&isProcessed=...&limit=50
router.get('/', async (req, res) => {
    try {
        const { profileId, platform, mediaType, isProcessed, limit } = req.query;
        const where = { deletedAt: null };
        if (profileId)
            where.profileId = profileId;
        if (platform)
            where.platform = platform;
        if (mediaType)
            where.mediaType = mediaType;
        if (isProcessed !== undefined && isProcessed !== '') {
            where.isProcessed = isProcessed === 'true';
        }
        const posts = await prisma_1.default.post.findMany({
            where,
            orderBy: { publishedAt: 'desc' },
            take: Math.min(parseInt(limit ?? '50', 10), 200),
            include: { profile: { select: { username: true, platform: true, displayName: true } } },
        });
        res.json((0, types_1.ok)(posts));
    }
    catch (err) {
        logger_1.default.error('GET /posts', { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch posts'));
    }
});
// GET /api/posts/:id  (full detail with media, analysis, reports)
router.get('/:id', async (req, res) => {
    try {
        const post = await prisma_1.default.post.findUnique({
            where: { id: req.params['id'] },
            include: {
                profile: { select: { username: true, platform: true, displayName: true, profilePicUrl: true } },
                media: { include: { mediaFiles: true } },
                analysis: true,
                reports: { orderBy: { generatedAt: 'desc' }, take: 5 },
            },
        });
        if (!post) {
            res.status(404).json((0, types_1.fail)('Post not found'));
            return;
        }
        res.json((0, types_1.ok)(post));
    }
    catch (err) {
        logger_1.default.error(`GET /posts/${req.params['id']}`, { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch post'));
    }
});
// GET /api/posts/:id/media
router.get('/:id/media', async (req, res) => {
    try {
        const media = await mediaRepo.getMediaForPost(req.params['id']);
        res.json((0, types_1.ok)(media));
    }
    catch (err) {
        logger_1.default.error(`GET /posts/${req.params['id']}/media`, { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch media'));
    }
});
exports.default = router;
//# sourceMappingURL=posts.routes.js.map