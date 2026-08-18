"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisRepository = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class AnalysisRepository {
    async create(data) {
        return prisma_1.default.analysis.create({ data });
    }
    async update(id, data) {
        return prisma_1.default.analysis.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
    }
    async findByPostId(postId) {
        return prisma_1.default.analysis.findUnique({ where: { postId } });
    }
    async findById(id) {
        return prisma_1.default.analysis.findUnique({ where: { id } });
    }
    async deleteByPostId(postId) {
        return prisma_1.default.analysis.deleteMany({ where: { postId } });
    }
}
exports.AnalysisRepository = AnalysisRepository;
//# sourceMappingURL=analysis.repository.js.map