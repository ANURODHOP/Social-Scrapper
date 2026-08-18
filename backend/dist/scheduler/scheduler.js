"use strict";
// src/scheduler/scheduler.ts
// Scheduler based on node-cron. Architecture is designed so BullMQ cron
// jobs can replace node-cron later without changing application logic.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = __importDefault(require("../logger"));
class Scheduler {
    constructor() {
        this.tasks = new Map();
    }
    static getInstance() {
        if (!Scheduler.instance) {
            Scheduler.instance = new Scheduler();
        }
        return Scheduler.instance;
    }
    /**
     * Schedule a recurring job.
     * @param name - Unique job name
     * @param cronExpression - Standard cron expression (5 or 6 fields)
     * @param handler - Async function to execute
     */
    schedule(name, cronExpression, handler) {
        if (this.tasks.has(name)) {
            logger_1.default.warn(`Scheduler: job "${name}" is already scheduled. Stopping previous instance.`);
            this.stop(name);
        }
        if (!node_cron_1.default.validate(cronExpression)) {
            throw new Error(`Scheduler: invalid cron expression "${cronExpression}" for job "${name}"`);
        }
        const task = node_cron_1.default.schedule(cronExpression, async () => {
            logger_1.default.info(`Scheduler: job "${name}" started`);
            const start = Date.now();
            try {
                await handler();
                logger_1.default.info(`Scheduler: job "${name}" completed in ${Date.now() - start}ms`);
            }
            catch (err) {
                logger_1.default.error(`Scheduler: job "${name}" failed after ${Date.now() - start}ms`, { error: err });
            }
        }, { scheduled: true });
        this.tasks.set(name, { name, expression: cronExpression, task });
        logger_1.default.info(`Scheduler: job "${name}" scheduled [${cronExpression}]`);
    }
    /**
     * Stop a specific job.
     */
    stop(name) {
        const scheduled = this.tasks.get(name);
        if (scheduled) {
            scheduled.task.stop();
            this.tasks.delete(name);
            logger_1.default.info(`Scheduler: job "${name}" stopped`);
        }
    }
    /**
     * Stop all jobs (used on graceful shutdown).
     */
    stopAll() {
        for (const [name] of this.tasks) {
            this.stop(name);
        }
        logger_1.default.info('Scheduler: all jobs stopped');
    }
    /**
     * List all active scheduled jobs.
     */
    listJobs() {
        return Array.from(this.tasks.values()).map(({ name, expression }) => ({ name, expression }));
    }
}
exports.Scheduler = Scheduler;
//# sourceMappingURL=scheduler.js.map