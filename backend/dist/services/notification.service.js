"use strict";
// src/services/notification.service.ts
// Wraps TelegramProvider with pipeline telemetry tracking.
// Records latency, logs bytes, and persists notification history.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const logger_1 = __importDefault(require("../logger"));
class NotificationService {
    constructor(telegram) {
        this.telegram = telegram;
    }
    /**
     * Send a Markdown report notification to Telegram.
     * Tracks latency and persists to NotificationHistory.
     */
    async sendReportToTelegram(opts) {
        const start = Date.now();
        logger_1.default.info(`NotificationService.sendReportToTelegram: postId=${opts.postId ?? 'n/a'}`);
        try {
            if (opts.documentPath) {
                // Send as document file (e.g. HTML/PDF report)
                const summary = opts.markdown.slice(0, 500) + (opts.markdown.length > 500 ? '…' : '');
                await this.telegram.sendDocumentFile(opts.chatId, opts.documentPath, summary);
            }
            else if (opts.thumbnailBuffer) {
                // Send thumbnail + summary via photo
                const summary = opts.markdown.slice(0, 900) + (opts.markdown.length > 900 ? '…' : '');
                await this.telegram.sendImageBuffer(opts.chatId, opts.thumbnailBuffer, summary);
                // Send full report as follow-up text (may be long)
                const remaining = opts.markdown.slice(900);
                if (remaining.trim()) {
                    await this.telegram.sendMarkdown(opts.chatId, remaining);
                }
            }
            else {
                await this.telegram.sendMarkdown(opts.chatId, opts.markdown);
            }
            const latencyMs = Date.now() - start;
            logger_1.default.info(`NotificationService: Telegram dispatch completed in ${latencyMs}ms`);
            await this.persistHistory({
                postId: opts.postId,
                profileId: opts.profileId,
                provider: 'telegram',
                recipient: opts.chatId,
                content: opts.documentPath ? `[Document sent] ${opts.documentPath}` : opts.markdown,
                status: 'sent',
            });
            return { latencyMs };
        }
        catch (err) {
            const latencyMs = Date.now() - start;
            const message = err instanceof Error ? err.message : String(err);
            logger_1.default.error(`NotificationService: Telegram dispatch failed after ${latencyMs}ms`, { error: message });
            await this.persistHistory({
                postId: opts.postId,
                profileId: opts.profileId,
                provider: 'telegram',
                recipient: opts.chatId,
                content: opts.documentPath ? `[Document failed] ${opts.documentPath}` : opts.markdown,
                status: 'failed',
            }).catch(() => undefined); // best-effort
            throw err;
        }
    }
    // ─── Private ─────────────────────────────────────────────────────────────
    async persistHistory(data) {
        await prisma_1.default.notificationHistory.create({
            data: {
                postId: data.postId,
                profileId: data.profileId,
                provider: data.provider,
                recipient: data.recipient,
                content: data.content.slice(0, 4000),
                status: data.status,
            },
        });
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map