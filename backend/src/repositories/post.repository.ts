import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class PostRepository {
  async findById(id: string) {
    return prisma.post.findUnique({ where: { id } });
  }

  async findByProfileId(profileId: string) {
    return prisma.post.findMany({
      where:   { profileId },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findByPlatformAndId(platform: string, platformId: string) {
    return prisma.post.findUnique({
      where: { platform_platformId: { platform, platformId } },
    });
  }

  async create(data: Prisma.PostUncheckedCreateInput) {
    return prisma.post.create({ data });
  }

  async update(id: string, data: Prisma.PostUpdateInput) {
    return prisma.post.update({ where: { id }, data });
  }

  async getUnprocessedPosts(profileId?: string) {
    return prisma.post.findMany({
      where: { isProcessed: false, ...(profileId ? { profileId } : {}) },
      orderBy: { publishedAt: 'asc' },
    });
  }

  async countForProfile(profileId: string) {
    return prisma.post.count({ where: { profileId } });
  }
}
