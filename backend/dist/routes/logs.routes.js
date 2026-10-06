"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/logs.routes.ts
const express_1 = require("express");
const firebase_1 = require("../firebase");
const types_1 = require("../types");
const logger_1 = __importDefault(require("../logger"));
const router = (0, express_1.Router)();
// GET /api/logs?level=error&limit=100
router.get('/', async (req, res) => {
    try {
        const level = req.query['level'];
        const limit = Math.min(parseInt(String(req.query['limit'] ?? '100'), 10), 500);
        let query = firebase_1.db.collection('logs').orderBy('createdAt', 'desc').limit(limit);
        if (level) {
            query = firebase_1.db.collection('logs').where('level', '==', level).orderBy('createdAt', 'desc').limit(limit);
        }
        const snap = await query.get();
        const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json((0, types_1.ok)(logs));
    }
    catch (err) {
        logger_1.default.error('GET /logs', { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch logs'));
    }
});
exports.default = router;
//# sourceMappingURL=logs.routes.js.map