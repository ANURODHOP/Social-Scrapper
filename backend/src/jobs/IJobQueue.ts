// src/jobs/IJobQueue.ts
// Abstraction over job queuing. Allows swapping between in-memory (dev)
// and BullMQ (production) without changing application logic.

export type JobHandler = (data: unknown) => Promise<void>;

export interface IJobQueue {
  /**
   * Add a job to the queue.
   * @param jobName - Logical job name (e.g. 'process-media', 'scrape-profile')
   * @param data - Serialisable job payload
   * @returns A job ID string
   */
  add(jobName: string, data: unknown): Promise<string>;

  /**
   * Register a handler for a job type.
   * Must be called before jobs of that type are added.
   */
  process(jobName: string, handler: JobHandler): void;

  /**
   * Gracefully shut down the queue.
   */
  close(): Promise<void>;
}
