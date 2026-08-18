// src/providers/notification/base.ts
// NotificationProvider — base interface for all notification providers.
// Telegram, Discord, Slack, WhatsApp, Email must implement this interface.

export interface NotificationProvider {
  /**
   * Send a simple text notification.
   */
  send(recipient: string, subject: string, content: string): Promise<void>;

  /**
   * Send a notification with extended options.
   * @param metadata - Provider-specific metadata (images, parse mode, attachments, etc.)
   */
  sendWithMetadata(
    recipient: string,
    subject: string,
    content: string,
    metadata?: unknown
  ): Promise<void>;
}