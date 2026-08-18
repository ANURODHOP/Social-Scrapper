export declare class Scheduler {
    private static instance;
    private readonly tasks;
    private constructor();
    static getInstance(): Scheduler;
    /**
     * Schedule a recurring job.
     * @param name - Unique job name
     * @param cronExpression - Standard cron expression (5 or 6 fields)
     * @param handler - Async function to execute
     */
    schedule(name: string, cronExpression: string, handler: () => Promise<void>): void;
    /**
     * Stop a specific job.
     */
    stop(name: string): void;
    /**
     * Stop all jobs (used on graceful shutdown).
     */
    stopAll(): void;
    /**
     * List all active scheduled jobs.
     */
    listJobs(): Array<{
        name: string;
        expression: string;
    }>;
}
//# sourceMappingURL=scheduler.d.ts.map