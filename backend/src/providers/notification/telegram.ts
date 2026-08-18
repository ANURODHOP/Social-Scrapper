// src/providers/notification/telegram.ts
// Telegram notification provider.
// Supports: text, Markdown, images (Buffer or file path), and PDF reports.
//
// Uses Telegram Bot API directly via axios (no third-party Telegram SDK).

import { NotificationProvider } from './base';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import logger from '../../logger';

interface TelegramSendOptions {
  parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  imageBuffer?: Buffer;
  imageName?: string;
  pdfPath?: string;
  pdfCaption?: string;
}

export class TelegramProvider implements NotificationProvider {
  private readonly botToken: string;
  private readonly defaultChatId: string;
  private readonly baseUrl: string;

  constructor(botToken: string, defaultChatId: string) {
    if (!botToken) throw new Error('TelegramProvider: botToken is required');
    if (!defaultChatId) throw new Error('TelegramProvider: defaultChatId is required');
    this.botToken = botToken;
    this.defaultChatId = defaultChatId;
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
    logger.info('TelegramProvider: initialized');
  }

  /**
   * Validate token via getMe.
   */
  async checkHealth(): Promise<void> {
    try {
      await axios.get(`${this.baseUrl}/getMe`, { timeout: 10_000 });
      logger.info('[TELEGRAM] Bot authentication: OK');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          throw new Error('TelegramProvider: Bot token rejected by Telegram (401). Check TELEGRAM_BOT_TOKEN.');
        }
      }
      throw err;
    }
  }

  /**
   * Send a plain text or Markdown message.
   */
  async send(recipient: string, _subject: string, content: string): Promise<void> {
    await this.sendMessage(recipient || this.defaultChatId, content);
  }

  /**
   * Send with metadata options (parse mode, attachments).
   */
  async sendWithMetadata(
    recipient: string,
    _subject: string,
    content: string,
    metadata?: TelegramSendOptions
  ): Promise<void> {
    const chatId = recipient || this.defaultChatId;
    const options = metadata ?? {};

    if (options.imageBuffer) {
      await this.sendPhoto(chatId, options.imageBuffer, content, options.imageName, options.parseMode);
    } else if (options.pdfPath) {
      await this.sendDocument(chatId, options.pdfPath, options.pdfCaption ?? content, options.parseMode);
    } else {
      await this.sendMessage(chatId, content, options.parseMode);
    }
  }

  /**
   * Send a Markdown-formatted message.
   */
  async sendMarkdown(chatId: string, markdown: string): Promise<void> {
    await this.sendMessage(chatId || this.defaultChatId, markdown, 'Markdown');
  }

  /**
   * Send an image from a Buffer.
   */
  async sendImageBuffer(chatId: string, imageBuffer: Buffer, caption?: string): Promise<void> {
    await this.sendPhoto(chatId || this.defaultChatId, imageBuffer, caption ?? '');
  }

  /**
   * Send a PDF or HTML document.
   */
  async sendDocumentFile(chatId: string, filePath: string, caption?: string): Promise<void> {
    await this.sendDocument(chatId || this.defaultChatId, filePath, caption ?? '');
  }

  // ─── Private API Helpers ───────────────────────────────────────────────────

  private async sendMessage(
    chatId: string,
    text: string,
    parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML'
  ): Promise<void> {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      text: this.truncate(text, 4096),
    };
    if (parseMode) body['parse_mode'] = parseMode;

    await this.post('/sendMessage', body);
    logger.info(`TelegramProvider.sendMessage: sent to chatId=${chatId}`);
  }

  private async sendPhoto(
    chatId: string,
    imageBuffer: Buffer,
    caption: string,
    fileName = 'image.jpg',
    parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML'
  ): Promise<void> {
    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('photo', imageBuffer, { filename: fileName, contentType: 'image/jpeg' });
    form.append('caption', this.truncate(caption, 1024));
    if (parseMode) form.append('parse_mode', parseMode);

    await this.postForm('/sendPhoto', form);
    logger.info(`TelegramProvider.sendPhoto: sent to chatId=${chatId}`);
  }

  private async sendDocument(
    chatId: string,
    filePath: string,
    caption: string,
    parseMode?: 'Markdown' | 'MarkdownV2' | 'HTML'
  ): Promise<void> {
    const form = new FormData();
    form.append('chat_id', chatId);
    
    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === '.html' ? 'text/html' : (ext === '.pdf' ? 'application/pdf' : 'application/octet-stream');
    
    form.append('document', fs.createReadStream(filePath), {
      filename: path.basename(filePath),
      contentType: contentType,
    });
    form.append('caption', this.truncate(caption, 1024));
    if (parseMode) form.append('parse_mode', parseMode);

    await this.postForm('/sendDocument', form);
    logger.info(`TelegramProvider.sendDocument: sent ${path.basename(filePath)} to chatId=${chatId}`);
  }

  private async post(endpoint: string, body: Record<string, unknown>): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}${endpoint}`, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30_000,
      });
    } catch (err) {
      this.handleTelegramError(err, endpoint);
    }
  }

  private async postForm(endpoint: string, form: FormData): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}${endpoint}`, form, {
        headers: form.getHeaders(),
        timeout: 60_000,
      });
    } catch (err) {
      this.handleTelegramError(err, endpoint);
    }
  }

  private handleTelegramError(err: unknown, endpoint: string): never {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const msg = err.response?.data?.description ?? err.message;
      logger.error(`TelegramProvider: API error on ${endpoint}`, { message: msg, status });
      
      if (status === 401) {
        throw new Error('TelegramProvider: Bot token rejected by Telegram (401). Check TELEGRAM_BOT_TOKEN.');
      }
      if (status === 403) {
        throw new Error('TelegramProvider: Bot does not have permission to send to the configured chat.');
      }
      throw new Error(`TelegramProvider: ${msg}`);
    }
    throw err;
  }

  private truncate(text: string, maxLen: number): string {
    return text.length > maxLen ? text.slice(0, maxLen - 3) + '...' : text;
  }
}
