"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileRepository = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class ProfileRepository {
    async findAll() {
        return prisma_1.default.profile.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async findAllMonitored() {
        return prisma_1.default.profile.findMany({ where: { isActive: true }, orderBy: { username: 'asc' } });
    }
    async findById(id) {
        return prisma_1.default.profile.findUnique({ where: { id } });
    }
    async findByPlatformAndId(platform, platformId) {
        return prisma_1.default.profile.findUnique({
            where: { platform_platformId: { platform, platformId } },
        });
    }
    async findByUsername(platform, username) {
        return prisma_1.default.profile.findFirst({ where: { platform, username } });
    }
    async create(data) {
        return prisma_1.default.profile.create({ data });
    }
    async update(id, data) {
        return prisma_1.default.profile.update({ where: { id }, data });
    }
    async softDelete(id) {
        return prisma_1.default.profile.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    }
    async count() {
        return prisma_1.default.profile.count({ where: { deletedAt: null } });
    }
}
exports.ProfileRepository = ProfileRepository;
//# sourceMappingURL=profile.repository.js.map