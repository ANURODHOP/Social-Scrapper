"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/posts.routes.ts
const express_1 = require("express");
const post_repository_1 = require("../repositories/post.repository");
const analysis_repository_1 = require("../repositories/analysis.repository");
const report_repository_1 = require("../repositories/report.repository");
const media_repository_1 = require("../repositories/media.repository");
const types_1 = require("../types");
const logger_1 = __importDefault(require("../logger"));
const router = (0, express_1.Router)();
const postRepo = new post_repository_1.PostRepository();
const mediaRepo = new media_repository_1.MediaRepository();
const analysisRepo = new analysis_repository_1.AnalysisRepository();
const reportRepo = new report_repository_1.ReportRepository();
// GET /api/posts?profileId=...&platform=...&mediaType=...&isProcessed=...&limit=50
router.get('/', async (req, res) => {
    try {
        const { profileId, platform, mediaType, isProcessed, limit } = req.query;
        // Start with all non-deleted posts, then filter
        let posts = await postRepo.findAll(Math.min(parseInt(limit ?? '50', 10), 200));
        if (profileId)
            posts = posts.filter(p => p.profileId === profileId);
        if (platform)
            posts = posts.filter(p => p.platform === platform);
        if (mediaType)
            posts = posts.filter(p => p.mediaType === mediaType);
        if (isProcessed !== undefined && isProcessed !== '') {
            const flag = isProcessed === 'true';
            posts = posts.filter(p => p.isProcessed === flag);
        }
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
        const id = req.params['id'];
        const post = await postRepo.findById(id);
        if (!post) {
            res.status(404).json((0, types_1.fail)('Post not found'));
            return;
        }
        const [media, analysis, reports] = await Promise.all([
            mediaRepo.getMediaForPost(id),
            analysisRepo.findByPostId(id),
            reportRepo.findByPostId(id),
        ]);
        res.json((0, types_1.ok)({ ...post, media, analysis, reports }));
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