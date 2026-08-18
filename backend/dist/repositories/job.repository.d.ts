import { Prisma } from '@prisma/client';
export declare class JobRepository {
    createScheduledJob(data: Prisma.ScheduledJobCreateInput): Promise<{
        result: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        data: string | null;
        status: string;
        attempts: number;
        maxAttempts: number;
        failedReason: string | null;
        scheduledAt: Date;
        processedAt: Date | null;
        finishedAt: Date | null;
    }>;
    updateScheduledJob(id: string, data: Prisma.ScheduledJobUpdateInput): Promise<{
        result: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        data: string | null;
        status: string;
        attempts: number;
        maxAttempts: number;
        failedReason: string | null;
        scheduledAt: Date;
        processedAt: Date | null;
        finishedAt: Date | null;
    }>;
    findScheduledJobById(id: string): Promise<{
        result: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        data: string | null;
        status: string;
        attempts: number;
        maxAttempts: number;
        failedReason: string | null;
        scheduledAt: Date;
        processedAt: Date | null;
        finishedAt: Date | null;
    } | null>;
    findScheduledJobs(status?: string): Promise<{
        result: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        data: string | null;
        status: string;
        attempts: number;
        maxAttempts: number;
        failedReason: string | null;
        scheduledAt: Date;
        processedAt: Date | null;
        finishedAt: Date | null;
    }[]>;
    createJobHistory(data: Prisma.JobHistoryCreateInput): Promise<{
        result: string | null;
        id: string;
        createdAt: Date;
        data: string | null;
        status: string;
        duration: number | null;
        failedReason: string | null;
        finishedAt: Date;
        jobName: string;
        startedAt: Date;
    }>;
    findJobHistory(limit?: number): Promise<{
        result: string | null;
        id: string;
        createdAt: Date;
        data: string | null;
        status: string;
        duration: number | null;
        failedReason: string | null;
        finishedAt: Date;
        jobName: string;
        startedAt: Date;
    }[]>;
    createSchedulerRun(name: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: string;
        finishedAt: Date | null;
        startedAt: Date;
    }>;
    finishSchedulerRun(id: string, status: 'completed' | 'failed'): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: string;
        finishedAt: Date | null;
        startedAt: Date;
    }>;
    findSchedulerRuns(limit?: number): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: string;
        finishedAt: Date | null;
        startedAt: Date;
    }[]>;
}
//# sourceMappingURL=job.repository.d.ts.map