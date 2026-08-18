"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRepository = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class JobRepository {
    async createScheduledJob(data) {
        return prisma_1.default.scheduledJob.create({ data });
    }
    async updateScheduledJob(id, data) {
        return prisma_1.default.scheduledJob.update({ where: { id }, data });
    }
    async findScheduledJobById(id) {
        return prisma_1.default.scheduledJob.findUnique({ where: { id } });
    }
    async findScheduledJobs(status) {
        return prisma_1.default.scheduledJob.findMany({
            where: status ? { status } : {},
            orderBy: { scheduledAt: 'desc' },
            take: 100,
        });
    }
    async createJobHistory(data) {
        return prisma_1.default.jobHistory.create({ data });
    }
    async findJobHistory(limit = 50) {
        return prisma_1.default.jobHistory.findMany({ orderBy: { finishedAt: 'desc' }, take: limit });
    }
    async createSchedulerRun(name) {
        return prisma_1.default.schedulerRun.create({ data: { name, status: 'started', startedAt: new Date() } });
    }
    async finishSchedulerRun(id, status) {
        return prisma_1.default.schedulerRun.update({ where: { id }, data: { status, finishedAt: new Date() } });
    }
    async findSchedulerRuns(limit = 20) {
        return prisma_1.default.schedulerRun.findMany({ orderBy: { startedAt: 'desc' }, take: limit });
    }
}
exports.JobRepository = JobRepository;
//# sourceMappingURL=job.repository.js.map