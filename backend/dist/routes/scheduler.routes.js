"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicHandlers = void 0;
// src/routes/scheduler.routes.ts
const express_1 = require("express");
const scheduler_1 = require("../scheduler");
const job_repository_1 = require("../repositories/job.repository");
const types_1 = require("../types");
const logger_1 = __importDefault(require("../logger"));
const router = (0, express_1.Router)();
const jobRepo = new job_repository_1.JobRepository();
// GET /api/scheduler/status
router.get('/status', (_req, res) => {
    try {
        const jobs = scheduler_1.Scheduler.getInstance().listJobs();
        res.json((0, types_1.ok)({ activeCronJobs: jobs }));
    }
    catch (err) {
        logger_1.default.error('GET /scheduler/status', { error: err });
        res.status(500).json((0, types_1.fail)('Failed to get scheduler status'));
    }
});
// GET /api/scheduler/runs
router.get('/runs', async (_req, res) => {
    try {
        const runs = await jobRepo.findSchedulerRuns(20);
        res.json((0, types_1.ok)(runs));
    }
    catch (err) {
        logger_1.default.error('GET /scheduler/runs', { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch scheduler runs'));
    }
});
// A mutable ref for the real handler injected from server.ts
exports.dynamicHandlers = {
    runProfileScan: null
};
// POST /api/scheduler/run
router.post('/run', async (_req, res) => {
    if (!exports.dynamicHandlers.runProfileScan) {
        logger_1.default.warn('POST /scheduler/run called before scheduler was initialised');
        res.status(503).json((0, types_1.fail)('Scheduler not yet initialised — retry in a moment'));
        return;
    }
    try {
        const result = await exports.dynamicHandlers.runProfileScan();
        res.json((0, types_1.ok)(result));
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger_1.default.error('POST /scheduler/run', { error: message });
        res.status(500).json((0, types_1.fail)(message));
    }
});
exports.default = router;
//# sourceMappingURL=scheduler.routes.js.map