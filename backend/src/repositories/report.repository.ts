import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class ReportRepository {
  async create(data: Prisma.ReportUncheckedCreateInput) {
    return prisma.report.create({ data });
  }

  async upsert(data: {
    postId?:   string;
    profileId?: string;
    type:      string;
    format:    string;
    title:     string;
    content:   string;
    filePath?: string;
  }) {
    // For post-level reports, ensure one report per type
    if (data.postId) {
      const existing = await prisma.report.findFirst({
        where: { postId: data.postId, type: data.type, format: data.format },
      });
      if (existing) {
        return prisma.report.update({
          where: { id: existing.id },
          data:  { content: data.content, filePath: data.filePath, generatedAt: new Date() },
        });
      }
    }
    return prisma.report.create({ data });
  }

  async findById(id: string) {
    return prisma.report.findUnique({ where: { id } });
  }

  async findByPostId(postId: string) {
    return prisma.report.findMany({ where: { postId }, orderBy: { generatedAt: 'desc' } });
  }

  async findByProfileId(profileId: string) {
    return prisma.report.findMany({ where: { profileId }, orderBy: { generatedAt: 'desc' } });
  }

  async findAll(limit = 50) {
    return prisma.report.findMany({ orderBy: { generatedAt: 'desc' }, take: limit });
  }
}
