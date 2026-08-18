export interface NotificationProvider {
    /**
     * Send a simple text notification.
     */
    send(recipient: string, subject: string, content: string): Promise<void>;
    /**
     * Send a notification with extended options.
     * @param metadata - Provider-specific metadata (images, parse mode, attachments, etc.)
     */
    sendWithMetadata(recipient: string, subject: string, content: string, metadata?: unknown): Promise<void>;
}
//# sourceMappingURL=base.d.ts.map