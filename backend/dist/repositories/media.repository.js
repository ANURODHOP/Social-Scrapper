"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaRepository = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class MediaRepository {
    async createMedia(data) {
        return prisma_1.default.media.create({ data });
    }
    async createMediaFile(data) {
        return prisma_1.default.mediaFiles.create({ data });
    }
    async getMediaForPost(postId) {
        return prisma_1.default.media.findMany({
            where: { postId },
            include: { mediaFiles: true }
        });
    }
}
exports.MediaRepository = MediaRepository;
//# sourceMappingURL=media.repository.js.map