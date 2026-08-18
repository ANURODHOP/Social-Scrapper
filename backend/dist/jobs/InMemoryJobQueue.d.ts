import { IJobQueue, JobHandler } from './IJobQueue';
export declare class InMemoryJobQueue implements IJobQueue {
    private readonly handlers;
    add(jobName: string, data: unknown): Promise<string>;
    process(jobName: string, handler: JobHandler): void;
    close(): Promise<void>;
}
//# sourceMappingURL=InMemoryJobQueue.d.ts.map