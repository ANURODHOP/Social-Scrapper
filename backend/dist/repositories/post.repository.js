"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRepository = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class PostRepository {
    async findById(id) {
        return prisma_1.default.post.findUnique({ where: { id } });
    }
    async findByProfileId(profileId) {
        return prisma_1.default.post.findMany({
            where: { profileId },
            orderBy: { publishedAt: 'desc' },
        });
    }
    async findByPlatformAndId(platform, platformId) {
        return prisma_1.default.post.findUnique({
            where: { platform_platformId: { platform, platformId } },
        });
    }
    async create(data) {
        return prisma_1.default.post.create({ data });
    }
    async update(id, data) {
        return prisma_1.default.post.update({ where: { id }, data });
    }
    async getUnprocessedPosts(profileId) {
        return prisma_1.default.post.findMany({
            where: { isProcessed: false, ...(profileId ? { profileId } : {}) },
            orderBy: { publishedAt: 'asc' },
        });
    }
    async countForProfile(profileId) {
        return prisma_1.default.post.count({ where: { profileId } });
    }
}
exports.PostRepository = PostRepository;
//# sourceMappingURL=post.repository.js.map