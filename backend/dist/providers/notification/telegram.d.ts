import { NotificationProvider } from './base';
interface TelegramSendOptions {
    parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML';
    imageBuffer?: Buffer;
    imageName?: string;
    pdfPath?: string;
    pdfCaption?: string;
}
export declare class TelegramProvider implements NotificationProvider {
    private readonly botToken;
    private readonly defaultChatId;
    private readonly baseUrl;
    constructor(botToken: string, defaultChatId: string);
    /**
     * Validate token via getMe.
     */
    checkHealth(): Promise<void>;
    /**
     * Send a plain text or Markdown message.
     */
    send(recipient: string, _subject: string, content: string): Promise<void>;
    /**
     * Send with metadata options (parse mode, attachments).
     */
    sendWithMetadata(recipient: string, _subject: string, content: string, metadata?: TelegramSendOptions): Promise<void>;
    /**
     * Send a Markdown-formatted message.
     */
    sendMarkdown(chatId: string, markdown: string): Promise<void>;
    /**
     * Send an image from a Buffer.
     */
    sendImageBuffer(chatId: string, imageBuffer: Buffer, caption?: string): Promise<void>;
    /**
     * Send a PDF or HTML document.
     */
    sendDocumentFile(chatId: string, filePath: string, caption?: string): Promise<void>;
    private sendMessage;
    private sendPhoto;
    private sendDocument;
    private post;
    private postForm;
    private handleTelegramError;
    private truncate;
}
export {};
//# sourceMappingURL=telegram.d.ts.map