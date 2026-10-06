import { ReportRepository } from '../../repositories/report.repository';
import { PostRepository } from '../../repositories/post.repository';
import { NotificationService } from '../notification.service';
import { StorageProvider } from '../../providers/storage/base';
export declare class DailyReportGenerator {
    constructor(_reportRepo: ReportRepository, _postRepo: PostRepository, _storage: StorageProvider, _notifications: NotificationService, _telegramChatId: string);
    generateDailyReport(): Promise<void>;
}
//# sourceMappingURL=DailyReportGenerator.d.ts.map