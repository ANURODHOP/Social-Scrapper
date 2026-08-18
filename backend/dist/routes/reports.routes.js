"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicHandlers = void 0;
// src/routes/reports.routes.ts
const express_1 = require("express");
const types_1 = require("../types");
const prisma_1 = __importDefault(require("../prisma"));
const logger_1 = __importDefault(require("../logger"));
const router = (0, express_1.Router)();
exports.dynamicHandlers = {
    sendReport: null
};
// GET /api/reports?postId=...&profileId=...&limit=...
router.get('/', async (req, res) => {
    try {
        const { postId, profileId, limit } = req.query;
        const take = Math.min(parseInt(limit ?? '50', 10), 200);
        const where = { deletedAt: null };
        if (postId)
            where.postId = postId;
        if (profileId)
            where.profileId = profileId;
        const reports = await prisma_1.default.report.findMany({
            where,
            orderBy: { generatedAt: 'desc' },
            take,
            include: {
                profile: { select: { username: true, platform: true } },
                post: { select: { mediaType: true, permalink: true, publishedAt: true } },
            },
        });
        res.json((0, types_1.ok)(reports));
    }
    catch (err) {
        logger_1.default.error('GET /reports', { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch reports'));
    }
});
// GET /api/reports/:id
router.get('/:id', async (req, res) => {
    try {
        const report = await prisma_1.default.report.findUnique({
            where: { id: req.params['id'] },
            include: {
                profile: { select: { username: true, platform: true } },
                post: { select: { mediaType: true, permalink: true, caption: true, publishedAt: true } },
            },
        });
        if (!report) {
            res.status(404).json((0, types_1.fail)('Report not found'));
            return;
        }
        res.json((0, types_1.ok)(report));
    }
    catch (err) {
        logger_1.default.error(`GET /reports/${req.params['id']}`, { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch report'));
    }
});
// POST /api/reports/:id/send
router.post('/:id/send', async (req, res) => {
    if (!exports.dynamicHandlers.sendReport) {
        res.status(501).json((0, types_1.fail)('Notification service not yet wired'));
        return;
    }
    try {
        const result = await exports.dynamicHandlers.sendReport(req.params['id']);
        res.json((0, types_1.ok)(result));
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger_1.default.error(`POST /reports/${req.params['id']}/send`, { error: message });
        res.status(500).json((0, types_1.fail)(message));
    }
});
exports.default = router;
//# sourceMappingURL=reports.routes.js.map