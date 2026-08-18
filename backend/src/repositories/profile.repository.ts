import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class ProfileRepository {
  async findAll() {
    return prisma.profile.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findAllMonitored() {
    return prisma.profile.findMany({ where: { isActive: true }, orderBy: { username: 'asc' } });
  }

  async findById(id: string) {
    return prisma.profile.findUnique({ where: { id } });
  }

  async findByPlatformAndId(platform: string, platformId: string) {
    return prisma.profile.findUnique({
      where: { platform_platformId: { platform, platformId } },
    });
  }

  async findByUsername(platform: string, username: string) {
    return prisma.profile.findFirst({ where: { platform, username } });
  }

  async create(data: Prisma.ProfileCreateInput) {
    return prisma.profile.create({ data });
  }

  async update(id: string, data: Prisma.ProfileUpdateInput) {
    return prisma.profile.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.profile.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  }

  async count() {
    return prisma.profile.count({ where: { deletedAt: null } });
  }
}
