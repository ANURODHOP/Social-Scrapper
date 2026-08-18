"use strict";
// src/providers/notification/telegram.ts
// Telegram notification provider.
// Supports: text, Markdown, images (Buffer or file path), and PDF reports.
//
// Uses Telegram Bot API directly via axios (no third-party Telegram SDK).
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const form_data_1 = __importDefault(require("form-data"));
const logger_1 = __importDefault(require("../../logger"));
class TelegramProvider {
    constructor(botToken, defaultChatId) {
        if (!botToken)
            throw new Error('TelegramProvider: botToken is required');
        if (!defaultChatId)
            throw new Error('TelegramProvider: defaultChatId is required');
        this.botToken = botToken;
        this.defaultChatId = defaultChatId;
        this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
        logger_1.default.info('TelegramProvider: initialized');
    }
    /**
     * Validate token via getMe.
     */
    async checkHealth() {
        try {
            await axios_1.default.get(`${this.baseUrl}/getMe`, { timeout: 10000 });
            logger_1.default.info('[TELEGRAM] Bot authentication: OK');
        }
        catch (err) {
            if (axios_1.default.isAxiosError(err)) {
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
    async send(recipient, _subject, content) {
        await this.sendMessage(recipient || this.defaultChatId, content);
    }
    /**
     * Send with metadata options (parse mode, attachments).
     */
    async sendWithMetadata(recipient, _subject, content, metadata) {
        const chatId = recipient || this.defaultChatId;
        const options = metadata ?? {};
        if (options.imageBuffer) {
            await this.sendPhoto(chatId, options.imageBuffer, content, options.imageName, options.parseMode);
        }
        else if (options.pdfPath) {
            await this.sendDocument(chatId, options.pdfPath, options.pdfCaption ?? content, options.parseMode);
        }
        else {
            await this.sendMessage(chatId, content, options.parseMode);
        }
    }
    /**
     * Send a Markdown-formatted message.
     */
    async sendMarkdown(chatId, markdown) {
        await this.sendMessage(chatId || this.defaultChatId, markdown, 'Markdown');
    }
    /**
     * Send an image from a Buffer.
     */
    async sendImageBuffer(chatId, imageBuffer, caption) {
        await this.sendPhoto(chatId || this.defaultChatId, imageBuffer, caption ?? '');
    }
    /**
     * Send a PDF or HTML document.
     */
    async sendDocumentFile(chatId, filePath, caption) {
        await this.sendDocument(chatId || this.defaultChatId, filePath, caption ?? '');
    }
    // ─── Private API Helpers ───────────────────────────────────────────────────
    async sendMessage(chatId, text, parseMode) {
        const body = {
            chat_id: chatId,
            text: this.truncate(text, 4096),
        };
        if (parseMode)
            body['parse_mode'] = parseMode;
        await this.post('/sendMessage', body);
        logger_1.default.info(`TelegramProvider.sendMessage: sent to chatId=${chatId}`);
    }
    async sendPhoto(chatId, imageBuffer, caption, fileName = 'image.jpg', parseMode) {
        const form = new form_data_1.default();
        form.append('chat_id', chatId);
        form.append('photo', imageBuffer, { filename: fileName, contentType: 'image/jpeg' });
        form.append('caption', this.truncate(caption, 1024));
        if (parseMode)
            form.append('parse_mode', parseMode);
        await this.postForm('/sendPhoto', form);
        logger_1.default.info(`TelegramProvider.sendPhoto: sent to chatId=${chatId}`);
    }
    async sendDocument(chatId, filePath, caption, parseMode) {
        const form = new form_data_1.default();
        form.append('chat_id', chatId);
        const ext = path_1.default.extname(filePath).toLowerCase();
        const contentType = ext === '.html' ? 'text/html' : (ext === '.pdf' ? 'application/pdf' : 'application/octet-stream');
        form.append('document', fs_1.default.createReadStream(filePath), {
            filename: path_1.default.basename(filePath),
            contentType: contentType,
        });
        form.append('caption', this.truncate(caption, 1024));
        if (parseMode)
            form.append('parse_mode', parseMode);
        await this.postForm('/sendDocument', form);
        logger_1.default.info(`TelegramProvider.sendDocument: sent ${path_1.default.basename(filePath)} to chatId=${chatId}`);
    }
    async post(endpoint, body) {
        try {
            await axios_1.default.post(`${this.baseUrl}${endpoint}`, body, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000,
            });
        }
        catch (err) {
            this.handleTelegramError(err, endpoint);
        }
    }
    async postForm(endpoint, form) {
        try {
            await axios_1.default.post(`${this.baseUrl}${endpoint}`, form, {
                headers: form.getHeaders(),
                timeout: 60000,
            });
        }
        catch (err) {
            this.handleTelegramError(err, endpoint);
        }
    }
    handleTelegramError(err, endpoint) {
        if (axios_1.default.isAxiosError(err)) {
            const status = err.response?.status;
            const msg = err.response?.data?.description ?? err.message;
            logger_1.default.error(`TelegramProvider: API error on ${endpoint}`, { message: msg, status });
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
    truncate(text, maxLen) {
        return text.length > maxLen ? text.slice(0, maxLen - 3) + '...' : text;
    }
}
exports.TelegramProvider = TelegramProvider;
//# sourceMappingURL=telegram.js.map