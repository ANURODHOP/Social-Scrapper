import { Scheduler } from './scheduler';
export { Scheduler };
export declare function getPipelineWorker(): any;
export declare function getProfileRepo(): any;
export declare function getPostRepo(): any;
export declare function getNotifications(): any;
export declare function getReportRepo(): any;
export declare function getScraper(): any;
export declare function getTelegram(): any;
export declare function getTelegramChatId(): string;
export declare let pipelineWorker: any;
export declare let profileRepo: any;
export declare let postRepo: any;
export declare let notifications: any;
export declare let reportRepo: any;
export declare let scraper: any;
export declare let telegram: any;
export declare let telegramChatId: string;
export declare function runProfileScan(): Promise<{
    processed: number;
    skipped: number;
}>;
/**
 * initScheduler — called ONCE from server.ts wireDynamicHandlers()
 * after all heavy dependencies have been dynamically imported.
 * Receives all pre-built singletons so this file never imports them statically.
 */
export declare function initScheduler(deps: {
    pipelineWorker: any;
    profileRepo: any;
    postRepo: any;
    notifications: any;
    reportRepo: any;
    scraper: any;
    telegram: any;
    jobRepo: any;
    telegramChatId: string;
}): void;
//# sourceMappingURL=index.d.ts.map