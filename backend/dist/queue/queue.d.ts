import { IJobQueue } from '../jobs/IJobQueue';
import { IMediaProcessorWorker } from '../workers/media.processor.worker.interface';
export declare class QueueService {
    private static instance;
    private readonly jobQueue;
    private readonly mediaProcessorWorker;
    private constructor();
    static getInstance(): QueueService;
    getJobQueue(): IJobQueue;
    getMediaProcessorWorker(): IMediaProcessorWorker;
    start(): void;
    close(): Promise<void>;
}
//# sourceMappingURL=queue.d.ts.map