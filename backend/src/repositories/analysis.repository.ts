import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class AnalysisRepository {
  async create(data: Prisma.AnalysisUncheckedCreateInput) {
    return prisma.analysis.create({ data });
  }

  async update(id: string, data: Prisma.AnalysisUpdateInput) {
    return prisma.analysis.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  }

  async findByPostId(postId: string) {
    return prisma.analysis.findUnique({ where: { postId } });
  }

  async findById(id: string) {
    return prisma.analysis.findUnique({ where: { id } });
  }

  async deleteByPostId(postId: string) {
    return prisma.analysis.deleteMany({ where: { postId } });
  }
}
