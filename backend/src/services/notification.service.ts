// src/services/notification.service.ts
// Wraps TelegramProvider with pipeline telemetry tracking.
// Records latency, logs bytes, and persists notification history.

import { TelegramProvider } from '../providers/notification/telegram';
import prisma from '../prisma';
import logger from '../logger';

export class NotificationService {
  private readonly telegram: TelegramProvider;

  constructor(telegram: TelegramProvider) {
    this.telegram = telegram;
  }

  /**
   * Send a Markdown report notification to Telegram.
   * Tracks latency and persists to NotificationHistory.
   */
  async sendReportToTelegram(opts: {
    chatId:    string;
    markdown:  string;
    postId?:   string;
    profileId?: string;
    thumbnailBuffer?: Buffer;
    documentPath?: string;
  }): Promise<{ latencyMs: number }> {
    const start = Date.now();
    logger.info(`NotificationService.sendReportToTelegram: postId=${opts.postId ?? 'n/a'}`);

    try {
      if (opts.documentPath) {
        // Send as document file (e.g. HTML/PDF report)
        const summary = opts.markdown.slice(0, 500) + (opts.markdown.length > 500 ? '…' : '');
        await this.telegram.sendDocumentFile(opts.chatId, opts.documentPath, summary);
      } else if (opts.thumbnailBuffer) {
        // Send thumbnail + summary via photo
        const summary = opts.markdown.slice(0, 900) + (opts.markdown.length > 900 ? '…' : '');
        await this.telegram.sendImageBuffer(opts.chatId, opts.thumbnailBuffer, summary);
        // Send full report as follow-up text (may be long)
        const remaining = opts.markdown.slice(900);
        if (remaining.trim()) {
          await this.telegram.sendMarkdown(opts.chatId, remaining);
        }
      } else {
        await this.telegram.sendMarkdown(opts.chatId, opts.markdown);
      }

      const latencyMs = Date.now() - start;
      logger.info(`NotificationService: Telegram dispatch completed in ${latencyMs}ms`);

      await this.persistHistory({
        postId:    opts.postId,
        profileId: opts.profileId,
        provider:  'telegram',
        recipient: opts.chatId,
        content:   opts.documentPath ? `[Document sent] ${opts.documentPath}` : opts.markdown,
        status:    'sent',
      });

      return { latencyMs };
    } catch (err) {
      const latencyMs = Date.now() - start;
      const message   = err instanceof Error ? err.message : String(err);

      logger.error(`NotificationService: Telegram dispatch failed after ${latencyMs}ms`, { error: message });

      await this.persistHistory({
        postId:    opts.postId,
        profileId: opts.profileId,
        provider:  'telegram',
        recipient: opts.chatId,
        content:   opts.documentPath ? `[Document failed] ${opts.documentPath}` : opts.markdown,
        status:    'failed',
      }).catch(() => undefined); // best-effort

      throw err;
    }
  }

  // ─── Private ─────────────────────────────────────────────────────────────

  private async persistHistory(data: {
    postId?:    string;
    profileId?: string;
    provider:   string;
    recipient:  string;
    content:    string;
    status:     string;
  }): Promise<void> {
    await prisma.notificationHistory.create({
      data: {
        postId:    data.postId,
        profileId: data.profileId,
        provider:  data.provider,
        recipient: data.recipient,
        content:   data.content.slice(0, 4000),
        status:    data.status,
      },
    });
  }
}
