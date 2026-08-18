import prisma from '../prisma';
import { Prisma } from '@prisma/client';

export class JobRepository {
  async createScheduledJob(data: Prisma.ScheduledJobCreateInput) {
    return prisma.scheduledJob.create({ data });
  }

  async updateScheduledJob(id: string, data: Prisma.ScheduledJobUpdateInput) {
    return prisma.scheduledJob.update({ where: { id }, data });
  }

  async findScheduledJobById(id: string) {
    return prisma.scheduledJob.findUnique({ where: { id } });
  }

  async findScheduledJobs(status?: string) {
    return prisma.scheduledJob.findMany({
      where:   status ? { status } : {},
      orderBy: { scheduledAt: 'desc' },
      take:    100,
    });
  }

  async createJobHistory(data: Prisma.JobHistoryCreateInput) {
    return prisma.jobHistory.create({ data });
  }

  async findJobHistory(limit = 50) {
    return prisma.jobHistory.findMany({ orderBy: { finishedAt: 'desc' }, take: limit });
  }

  async createSchedulerRun(name: string) {
    return prisma.schedulerRun.create({ data: { name, status: 'started', startedAt: new Date() } });
  }

  async finishSchedulerRun(id: string, status: 'completed' | 'failed') {
    return prisma.schedulerRun.update({ where: { id }, data: { status, finishedAt: new Date() } });
  }

  async findSchedulerRuns(limit = 20) {
    return prisma.schedulerRun.findMany({ orderBy: { startedAt: 'desc' }, take: limit });
  }
}
