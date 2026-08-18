import { IMediaProcessorWorker } from './media.processor.worker.interface';
import { IJobQueue } from '../jobs/IJobQueue';
export declare class MediaProcessorWorker implements IMediaProcessorWorker {
    private readonly jobQueue;
    private running;
    constructor(jobQueue: IJobQueue);
    start(): void;
    stop(): Promise<void>;
}
//# sourceMappingURL=media.processor.worker.d.ts.map