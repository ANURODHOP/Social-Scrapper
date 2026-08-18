"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/media.routes.ts
const express_1 = require("express");
const media_repository_1 = require("../repositories/media.repository");
const types_1 = require("../types");
const logger_1 = __importDefault(require("../logger"));
const router = (0, express_1.Router)();
const mediaRepo = new media_repository_1.MediaRepository();
// GET /api/media/post/:postId
router.get('/post/:postId', async (req, res) => {
    try {
        const media = await mediaRepo.getMediaForPost(req.params['postId']);
        res.json((0, types_1.ok)(media));
    }
    catch (err) {
        logger_1.default.error(`GET /media/post/${req.params['postId']}`, { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch media'));
    }
});
exports.default = router;
//# sourceMappingURL=media.routes.js.map