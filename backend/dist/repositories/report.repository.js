"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRepository = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class ReportRepository {
    async create(data) {
        return prisma_1.default.report.create({ data });
    }
    async upsert(data) {
        // For post-level reports, ensure one report per type
        if (data.postId) {
            const existing = await prisma_1.default.report.findFirst({
                where: { postId: data.postId, type: data.type, format: data.format },
            });
            if (existing) {
                return prisma_1.default.report.update({
                    where: { id: existing.id },
                    data: { content: data.content, filePath: data.filePath, generatedAt: new Date() },
                });
            }
        }
        return prisma_1.default.report.create({ data });
    }
    async findById(id) {
        return prisma_1.default.report.findUnique({ where: { id } });
    }
    async findByPostId(postId) {
        return prisma_1.default.report.findMany({ where: { postId }, orderBy: { generatedAt: 'desc' } });
    }
    async findByProfileId(profileId) {
        return prisma_1.default.report.findMany({ where: { profileId }, orderBy: { generatedAt: 'desc' } });
    }
    async findAll(limit = 50) {
        return prisma_1.default.report.findMany({ orderBy: { generatedAt: 'desc' }, take: limit });
    }
}
exports.ReportRepository = ReportRepository;
//# sourceMappingURL=report.repository.js.map