"use strict";
// src/queue/queue.ts
// QueueService — thin wrapper around IJobQueue providing a singleton and
// initialising the MediaProcessorWorker.
//
// ARCHITECTURE NOTE: This service depends only on IJobQueue, not on any
// concrete implementation. To switch from InMemoryJobQueue to BullMQ:
//   1. Create BullMQJobQueue implements IJobQueue
//   2. Replace new InMemoryJobQueue() below with new BullMQJobQueue(redisConfig)
//   3. No other files need to change.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const InMemoryJobQueue_1 = require("../jobs/InMemoryJobQueue");
const media_processor_worker_1 = require("../workers/media.processor.worker");
const logger_1 = __importDefault(require("../logger"));
class QueueService {
    constructor() {
        // Use InMemoryJobQueue for development (no Redis required).
        // Replace with BullMQJobQueue for production.
        this.jobQueue = new InMemoryJobQueue_1.InMemoryJobQueue();
        this.mediaProcessorWorker = new media_processor_worker_1.MediaProcessorWorker(this.jobQueue);
        logger_1.default.info('QueueService: initialized with InMemoryJobQueue');
    }
    static getInstance() {
        if (!QueueService.instance) {
            QueueService.instance = new QueueService();
        }
        return QueueService.instance;
    }
    getJobQueue() {
        return this.jobQueue;
    }
    getMediaProcessorWorker() {
        return this.mediaProcessorWorker;
    }
    start() {
        this.mediaProcessorWorker.start();
        logger_1.default.info('QueueService: workers started');
    }
    async close() {
        await this.mediaProcessorWorker.stop();
        await this.jobQueue.close();
        logger_1.default.info('QueueService: closed');
    }
}
exports.QueueService = QueueService;
//# sourceMappingURL=queue.js.map