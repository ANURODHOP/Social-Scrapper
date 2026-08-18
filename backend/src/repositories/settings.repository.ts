import prisma from '../prisma';

export class SettingsRepository {
  async getSetting(platform: string, key: string) {
    return prisma.platformSettings.findUnique({
      where: { platform_key: { platform, key } }
    });
  }

  async setSetting(platform: string, key: string, value: string, description?: string) {
    return prisma.platformSettings.upsert({
      where: { platform_key: { platform, key } },
      update: { value, description },
      create: { platform, key, value, description }
    });
  }

  async getAllSettings() {
    return prisma.platformSettings.findMany({ orderBy: [{ platform: 'asc' }, { key: 'asc' }] });
  }
}
