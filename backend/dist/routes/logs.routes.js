"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/logs.routes.ts
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const types_1 = require("../types");
const logger_1 = __importDefault(require("../logger"));
const router = (0, express_1.Router)();
// GET /api/logs?level=error&limit=100
router.get('/', async (req, res) => {
    try {
        const level = req.query['level'];
        const limit = Math.min(parseInt(String(req.query['limit'] ?? '100'), 10), 500);
        const logs = await prisma_1.default.log.findMany({
            where: level ? { level } : {},
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        res.json((0, types_1.ok)(logs));
    }
    catch (err) {
        logger_1.default.error('GET /logs', { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch logs'));
    }
});
exports.default = router;
//# sourceMappingURL=logs.routes.js.map