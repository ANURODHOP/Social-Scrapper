// src/workers/media.processor.worker.ts
import { IMediaProcessorWorker } from './media.processor.worker.interface';
import { IJobQueue } from '../jobs/IJobQueue';
import logger from '../logger';

interface MediaJobData {
  mediaId: string;
  filePath: string;
  mediaType: string;
}

export class MediaProcessorWorker implements IMediaProcessorWorker {
  private readonly jobQueue: IJobQueue;
  private running = false;

  constructor(jobQueue: IJobQueue) {
    this.jobQueue = jobQueue;
  }

  start(): void {
    if (this.running) {
      logger.warn('MediaProcessorWorker: already running');
      return;
    }
    this.running = true;
    logger.info('MediaProcessorWorker: started');

    this.jobQueue.process('process-media', async (data: unknown) => {
      const job = data as MediaJobData;
      logger.info(`MediaProcessorWorker: processing media ${job.mediaId}`, {
        filePath: job.filePath,
        mediaType: job.mediaType,
      });

      // TODO Phase 8: implement actual processing pipeline
      // 1. Frame extraction (ffmpeg)
      // 2. Audio extraction (ffmpeg)
      // 3. Whisper transcription
      // 5. Deterministic report generation
      // 6. Report generation
      // 7. Telegram notification

      logger.info(`MediaProcessorWorker: queued media ${job.mediaId} for processing (pipeline not yet implemented)`);
    });
  }

  async stop(): Promise<void> {
    this.running = false;
    logger.info('MediaProcessorWorker: stopped');
  }
}
