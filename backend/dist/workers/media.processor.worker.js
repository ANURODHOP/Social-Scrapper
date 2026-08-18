"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaProcessorWorker = void 0;
const logger_1 = __importDefault(require("../logger"));
class MediaProcessorWorker {
    constructor(jobQueue) {
        this.running = false;
        this.jobQueue = jobQueue;
    }
    start() {
        if (this.running) {
            logger_1.default.warn('MediaProcessorWorker: already running');
            return;
        }
        this.running = true;
        logger_1.default.info('MediaProcessorWorker: started');
        this.jobQueue.process('process-media', async (data) => {
            const job = data;
            logger_1.default.info(`MediaProcessorWorker: processing media ${job.mediaId}`, {
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
            logger_1.default.info(`MediaProcessorWorker: queued media ${job.mediaId} for processing (pipeline not yet implemented)`);
        });
    }
    async stop() {
        this.running = false;
        logger_1.default.info('MediaProcessorWorker: stopped');
    }
}
exports.MediaProcessorWorker = MediaProcessorWorker;
//# sourceMappingURL=media.processor.worker.js.map