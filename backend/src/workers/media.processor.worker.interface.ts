// src/workers/media.processor.worker.interface.ts
export interface IMediaProcessorWorker {
  /**
   * Start listening for and processing media jobs.
   */
  start(): void;

  /**
   * Stop the worker and release resources.
   */
  stop(): Promise<void>;
}
