// src/scheduler/scheduler.ts
// Scheduler based on node-cron. Architecture is designed so BullMQ cron
// jobs can replace node-cron later without changing application logic.

import cron from 'node-cron';
import logger from '../logger';

interface ScheduledTask {
  name: string;
  expression: string;
  task: cron.ScheduledTask;
}

export class Scheduler {
  private static instance: Scheduler;
  private readonly tasks = new Map<string, ScheduledTask>();

  private constructor() {}

  public static getInstance(): Scheduler {
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
  public schedule(
    name: string,
    cronExpression: string,
    handler: () => Promise<void>
  ): void {
    if (this.tasks.has(name)) {
      logger.warn(`Scheduler: job "${name}" is already scheduled. Stopping previous instance.`);
      this.stop(name);
    }

    if (!cron.validate(cronExpression)) {
      throw new Error(`Scheduler: invalid cron expression "${cronExpression}" for job "${name}"`);
    }

    const task = cron.schedule(
      cronExpression,
      async () => {
        logger.info(`Scheduler: job "${name}" started`);
        const start = Date.now();
        try {
          await handler();
          logger.info(`Scheduler: job "${name}" completed in ${Date.now() - start}ms`);
        } catch (err) {
          logger.error(`Scheduler: job "${name}" failed after ${Date.now() - start}ms`, { error: err });
        }
      },
      { scheduled: true }
    );

    this.tasks.set(name, { name, expression: cronExpression, task });
    logger.info(`Scheduler: job "${name}" scheduled [${cronExpression}]`);
  }

  /**
   * Stop a specific job.
   */
  public stop(name: string): void {
    const scheduled = this.tasks.get(name);
    if (scheduled) {
      scheduled.task.stop();
      this.tasks.delete(name);
      logger.info(`Scheduler: job "${name}" stopped`);
    }
  }

  /**
   * Stop all jobs (used on graceful shutdown).
   */
  public stopAll(): void {
    for (const [name] of this.tasks) {
      this.stop(name);
    }
    logger.info('Scheduler: all jobs stopped');
  }

  /**
   * List all active scheduled jobs.
   */
  public listJobs(): Array<{ name: string; expression: string }> {
    return Array.from(this.tasks.values()).map(({ name, expression }) => ({ name, expression }));
  }
}
