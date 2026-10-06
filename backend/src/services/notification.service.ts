// src/services/notification.service.ts
// Wraps TelegramProvider with pipeline telemetry tracking.
// Records latency and logs notification attempts to Firestore.

import { TelegramProvider } from '../providers/notification/telegram';
import { db } from '../firebase';
import { randomUUID } from 'crypto';
import logger from '../logger';

export class NotificationService {
  private readonly telegram: TelegramProvider;

  constructor(telegram: TelegramProvider) {
    this.telegram = telegram;
  }

  /**
   * Send a Markdown report notification to Telegram.
   * Tracks latency and persists to Firestore notificationHistory.
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
        const summary = opts.markdown.slice(0, 500) + (opts.markdown.length > 500 ? '…' : '');
        await this.telegram.sendDocumentFile(opts.chatId, opts.documentPath, summary);
      } else if (opts.thumbnailBuffer) {
        const summary = opts.markdown.slice(0, 900) + (opts.markdown.length > 900 ? '…' : '');
        await this.telegram.sendImageBuffer(opts.chatId, opts.thumbnailBuffer, summary);
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
    const id = randomUUID();
    await db.collection('notificationHistory').doc(id).set({
      postId:    data.postId ?? null,
      profileId: data.profileId ?? null,
      provider:  data.provider,
      recipient: data.recipient,
      content:   data.content.slice(0, 4000),
      status:    data.status,
      createdAt: new Date(),
    });
  }
}
