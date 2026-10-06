export interface ScheduledJobDoc {
    id: string;
    name: string;
    status: string;
    scheduledAt: Date;
    metadata?: any;
}
export interface JobHistoryDoc {
    id: string;
    name: string;
    status: string;
    startedAt: Date;
    finishedAt: Date;
    error?: string | null;
}
export interface SchedulerRunDoc {
    id: string;
    name: string;
    status: 'started' | 'completed' | 'failed';
    startedAt: Date;
    finishedAt?: Date | null;
}
export declare class JobRepository {
    createScheduledJob(data: Omit<ScheduledJobDoc, 'id'>): Promise<ScheduledJobDoc>;
    updateScheduledJob(id: string, data: Partial<Omit<ScheduledJobDoc, 'id'>>): Promise<ScheduledJobDoc>;
    findScheduledJobById(id: string): Promise<ScheduledJobDoc | null>;
    findScheduledJobs(status?: string): Promise<ScheduledJobDoc[]>;
    createJobHistory(data: Omit<JobHistoryDoc, 'id'>): Promise<JobHistoryDoc>;
    findJobHistory(limitCount?: number): Promise<JobHistoryDoc[]>;
    createSchedulerRun(name: string): Promise<SchedulerRunDoc>;
    finishSchedulerRun(id: string, status: 'completed' | 'failed'): Promise<SchedulerRunDoc>;
    findSchedulerRuns(limitCount?: number): Promise<SchedulerRunDoc[]>;
}
//# sourceMappingURL=job.repository.d.ts.map