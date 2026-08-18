"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/jobs.routes.ts
const express_1 = require("express");
const job_repository_1 = require("../repositories/job.repository");
const types_1 = require("../types");
const logger_1 = __importDefault(require("../logger"));
const router = (0, express_1.Router)();
const jobRepo = new job_repository_1.JobRepository();
// GET /api/jobs?status=...
router.get('/', async (req, res) => {
    try {
        const status = req.query['status'];
        const jobs = await jobRepo.findScheduledJobs(status);
        res.json((0, types_1.ok)(jobs));
    }
    catch (err) {
        logger_1.default.error('GET /jobs', { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch jobs'));
    }
});
// GET /api/jobs/history
router.get('/history', async (req, res) => {
    try {
        const limit = parseInt(String(req.query['limit'] ?? '50'), 10);
        const history = await jobRepo.findJobHistory(limit);
        res.json((0, types_1.ok)(history));
    }
    catch (err) {
        logger_1.default.error('GET /jobs/history', { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch job history'));
    }
});
// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
    try {
        const job = await jobRepo.findScheduledJobById(req.params['id']);
        if (!job) {
            res.status(404).json((0, types_1.fail)('Job not found'));
            return;
        }
        res.json((0, types_1.ok)(job));
    }
    catch (err) {
        logger_1.default.error(`GET /jobs/${req.params['id']}`, { error: err });
        res.status(500).json((0, types_1.fail)('Failed to fetch job'));
    }
});
exports.default = router;
//# sourceMappingURL=jobs.routes.js.map