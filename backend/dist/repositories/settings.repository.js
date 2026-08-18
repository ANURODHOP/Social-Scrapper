"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRepository = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class SettingsRepository {
    async getSetting(platform, key) {
        return prisma_1.default.platformSettings.findUnique({
            where: { platform_key: { platform, key } }
        });
    }
    async setSetting(platform, key, value, description) {
        return prisma_1.default.platformSettings.upsert({
            where: { platform_key: { platform, key } },
            update: { value, description },
            create: { platform, key, value, description }
        });
    }
    async getAllSettings() {
        return prisma_1.default.platformSettings.findMany({ orderBy: [{ platform: 'asc' }, { key: 'asc' }] });
    }
}
exports.SettingsRepository = SettingsRepository;
//# sourceMappingURL=settings.repository.js.map