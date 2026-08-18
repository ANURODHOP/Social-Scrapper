// src/jobs/InMemoryJobQueue.ts
// In-process job queue using setImmediate for async execution.
// Designed to be replaced by BullMQ by implementing IJobQueue on a BullMQ wrapper.

import { IJobQueue, JobHandler } from './IJobQueue';
import logger from '../logger';

let idCounter = 0;
function nextId(): string {
  return String(++idCounter);
}

export class InMemoryJobQueue implements IJobQueue {
  private readonly handlers = new Map<string, JobHandler>();

  async add(jobName: string, data: unknown): Promise<string> {
    const id = nextId();
    const handler = this.handlers.get(jobName);

    if (!handler) {
      logger.warn(`InMemoryJobQueue: no handler registered for job "${jobName}". Job ${id} will be dropped.`);
      return id;
    }

    setImmediate(() => {
      logger.debug(`InMemoryJobQueue: executing job "${jobName}" id=${id}`);
      handler(data).catch((err: unknown) => {
        logger.error(`InMemoryJobQueue: job "${jobName}" id=${id} failed`, { error: err });
      });
    });

    return id;
  }

  process(jobName: string, handler: JobHandler): void {
    if (this.handlers.has(jobName)) {
      logger.warn(`InMemoryJobQueue: overwriting handler for job "${jobName}"`);
    }
    this.handlers.set(jobName, handler);
    logger.debug(`InMemoryJobQueue: registered handler for job "${jobName}"`);
  }

  async close(): Promise<void> {
    this.handlers.clear();
    logger.info('InMemoryJobQueue: closed');
  }
}
