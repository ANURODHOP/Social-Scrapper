// src/queue/queue.ts
// QueueService — thin wrapper around IJobQueue providing a singleton and
// initialising the MediaProcessorWorker.
//
// ARCHITECTURE NOTE: This service depends only on IJobQueue, not on any
// concrete implementation. To switch from InMemoryJobQueue to BullMQ:
//   1. Create BullMQJobQueue implements IJobQueue
//   2. Replace new InMemoryJobQueue() below with new BullMQJobQueue(redisConfig)
//   3. No other files need to change.

import { IJobQueue } from '../jobs/IJobQueue';
import { InMemoryJobQueue } from '../jobs/InMemoryJobQueue';
import { IMediaProcessorWorker } from '../workers/media.processor.worker.interface';
import { MediaProcessorWorker } from '../workers/media.processor.worker';
import logger from '../logger';

export class QueueService {
  private static instance: QueueService;
  private readonly jobQueue: IJobQueue;
  private readonly mediaProcessorWorker: IMediaProcessorWorker;

  private constructor() {
    // Use InMemoryJobQueue for development (no Redis required).
    // Replace with BullMQJobQueue for production.
    this.jobQueue = new InMemoryJobQueue();
    this.mediaProcessorWorker = new MediaProcessorWorker(this.jobQueue);

    logger.info('QueueService: initialized with InMemoryJobQueue');
  }

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  public getJobQueue(): IJobQueue {
    return this.jobQueue;
  }

  public getMediaProcessorWorker(): IMediaProcessorWorker {
    return this.mediaProcessorWorker;
  }

  public start(): void {
    this.mediaProcessorWorker.start();
    logger.info('QueueService: workers started');
  }

  public async close(): Promise<void> {
    await this.mediaProcessorWorker.stop();
    await this.jobQueue.close();
    logger.info('QueueService: closed');
  }
}