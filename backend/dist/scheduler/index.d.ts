import { Scheduler } from './scheduler';
import { ProfileRepository } from '../repositories/profile.repository';
import { PostRepository } from '../repositories/post.repository';
import { ReportRepository } from '../repositories/report.repository';
import { PipelineWorker } from '../workers/pipeline.worker';
import { ScraperService } from '../services/scraper.service';
import { NotificationService } from '../services/notification.service';
import { TelegramProvider } from '../providers/notification/telegram';
export { Scheduler };
declare const telegram: TelegramProvider;
declare const notifications: NotificationService;
declare const profileRepo: ProfileRepository;
declare const postRepo: PostRepository;
declare const reportRepo: ReportRepository;
declare const pipelineWorker: PipelineWorker;
declare const scraper: ScraperService;
export declare const telegramChatId: string;
/**
 * Run the full scan across all monitored profiles, respecting concurrency.
 * Called both by the cron job and by POST /api/scheduler/run.
 */
export declare function runProfileScan(): Promise<{
    processed: number;
    skipped: number;
}>;
export declare function initScheduler(): void;
export { pipelineWorker, profileRepo, postRepo, notifications, reportRepo, scraper, telegram };
//# sourceMappingURL=index.d.ts.map