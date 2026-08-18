"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/analysis.routes.ts
const express_1 = require("express");
const analysis_repository_1 = require("../repositories/analysis.repository");
const types_1 = require("../types");
const logger_1 = __importDefault(require("../logger"));
const router = (0, express_1.Router)();
const analysisRepo = new analysis_repository_1.AnalysisRepository();
// GET /api/analysis/:id
router.get('/:id', async (req, res) => {
    try {
        const analysis = await analysisRepo.findById(req.params['id']);
        if (!analysis) {
            res.status(404).json((0, types_1.fail)('Analysis not found'));
            return;
        }
        res.json((0, types_1.ok)(analysis));
    }
    catch (err) {
        logger_1.default.error(`GET /analysis/${req.params['id']}`, { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch analysis'));
    }
});
// GET /api/analysis/post/:postId
router.get('/post/:postId', async (req, res) => {
    try {
        const analysis = await analysisRepo.findByPostId(req.params['postId']);
        if (!analysis) {
            res.status(404).json((0, types_1.fail)('Analysis not found for this post'));
            return;
        }
        res.json((0, types_1.ok)(analysis));
    }
    catch (err) {
        logger_1.default.error(`GET /analysis/post/${req.params['postId']}`, { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch analysis'));
    }
});
// POST /api/analysis/:id/retry
router.post('/:id/retry', async (req, res) => {
    try {
        const analysis = await analysisRepo.findById(req.params['id']);
        if (!analysis) {
            res.status(404).json((0, types_1.fail)('Analysis not found'));
            return;
        }
        await analysisRepo.deleteByPostId(analysis.postId);
        const { PostRepository } = await Promise.resolve().then(() => __importStar(require('../repositories/post.repository')));
        await new PostRepository().update(analysis.postId, { isProcessed: false });
        logger_1.default.info(`POST /analysis/${req.params['id']}/retry: re-queued postId=${analysis.postId}`);
        res.json((0, types_1.ok)({ retrying: true, postId: analysis.postId }));
    }
    catch (err) {
        logger_1.default.error(`POST /analysis/${req.params['id']}/retry`, { error: err });
        res.status(500).json((0, types_1.fail)('Failed to retry analysis'));
    }
});
exports.default = router;
//# sourceMappingURL=analysis.routes.js.map