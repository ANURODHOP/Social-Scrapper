import { TelegramProvider } from '../providers/notification/telegram';
export declare class NotificationService {
    private readonly telegram;
    constructor(telegram: TelegramProvider);
    /**
     * Send a Markdown report notification to Telegram.
     * Tracks latency and persists to NotificationHistory.
     */
    sendReportToTelegram(opts: {
        chatId: string;
        markdown: string;
        postId?: string;
        profileId?: string;
        thumbnailBuffer?: Buffer;
        documentPath?: string;
    }): Promise<{
        latencyMs: number;
    }>;
    private persistHistory;
}
//# sourceMappingURL=notification.service.d.ts.map