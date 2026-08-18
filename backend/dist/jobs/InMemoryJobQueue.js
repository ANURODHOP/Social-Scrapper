"use strict";
// src/jobs/InMemoryJobQueue.ts
// In-process job queue using setImmediate for async execution.
// Designed to be replaced by BullMQ by implementing IJobQueue on a BullMQ wrapper.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryJobQueue = void 0;
const logger_1 = __importDefault(require("../logger"));
let idCounter = 0;
function nextId() {
    return String(++idCounter);
}
class InMemoryJobQueue {
    constructor() {
        this.handlers = new Map();
    }
    async add(jobName, data) {
        const id = nextId();
        const handler = this.handlers.get(jobName);
        if (!handler) {
            logger_1.default.warn(`InMemoryJobQueue: no handler registered for job "${jobName}". Job ${id} will be dropped.`);
            return id;
        }
        setImmediate(() => {
            logger_1.default.debug(`InMemoryJobQueue: executing job "${jobName}" id=${id}`);
            handler(data).catch((err) => {
                logger_1.default.error(`InMemoryJobQueue: job "${jobName}" id=${id} failed`, { error: err });
            });
        });
        return id;
    }
    process(jobName, handler) {
        if (this.handlers.has(jobName)) {
            logger_1.default.warn(`InMemoryJobQueue: overwriting handler for job "${jobName}"`);
        }
        this.handlers.set(jobName, handler);
        logger_1.default.debug(`InMemoryJobQueue: registered handler for job "${jobName}"`);
    }
    async close() {
        this.handlers.clear();
        logger_1.default.info('InMemoryJobQueue: closed');
    }
}
exports.InMemoryJobQueue = InMemoryJobQueue;
//# sourceMappingURL=InMemoryJobQueue.js.map