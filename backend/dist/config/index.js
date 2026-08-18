"use strict";
// src/config/index.ts
// Centralized configuration loader.
// Priority (highest to lowest):
//   1. Environment variables
//   2. Environment-specific YAML (e.g., development.yaml, production.yaml)
//   3. Default YAML (default.yaml)
//
// NOTE: dotenv must be loaded BEFORE this module is imported.
// Ensure `import 'dotenv/config'` is the first line of server.ts.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const js_yaml_1 = __importDefault(require("js-yaml"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class Config {
    constructor() {
        this.config = this.loadConfig();
    }
    static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }
    get(key) {
        return this.config[key];
    }
    loadConfig() {
        // __dirname resolves correctly both in ts-node (src/config/) and after tsc (dist/config/)
        const configDir = __dirname;
        let config = this.loadYamlFile(path_1.default.join(configDir, 'default.yaml'));
        const env = process.env['NODE_ENV'] ?? 'development';
        const envConfigPath = path_1.default.join(configDir, `${env}.yaml`);
        if (fs_1.default.existsSync(envConfigPath)) {
            const envConfig = this.loadYamlFile(envConfigPath);
            config = this.deepMerge(config, envConfig);
        }
        config = this.overrideWithEnv(config);
        return config;
    }
    loadYamlFile(filePath) {
        try {
            const fileContents = fs_1.default.readFileSync(filePath, 'utf8');
            const parsed = js_yaml_1.default.load(fileContents);
            return (parsed && typeof parsed === 'object' ? parsed : {});
        }
        catch (error) {
            // During first run, the file may not yet exist
            console.warn(`Config: could not load ${filePath}:`, error.message);
            return {};
        }
    }
    deepMerge(target, source) {
        const result = { ...target };
        for (const key of Object.keys(source)) {
            const sv = source[key];
            const tv = target[key];
            if (sv !== null && typeof sv === 'object' && !Array.isArray(sv) &&
                tv !== null && typeof tv === 'object' && !Array.isArray(tv)) {
                result[key] = this.deepMerge(tv, sv);
            }
            else {
                result[key] = sv;
            }
        }
        return result;
    }
    overrideWithEnv(config) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        const c = config;
        // Database
        if (process.env['DATABASE_URL']) {
            c.database ?? (c.database = {});
            c.database.url = process.env['DATABASE_URL'];
        }
        // Server
        if (process.env['PORT'])
            c.port = parseInt(process.env['PORT'], 10);
        if (process.env['NODE_ENV'])
            c.nodeEnv = process.env['NODE_ENV'];
        // AI Providers
        if (process.env['GEMINI_API_KEY']) {
            c.ai ?? (c.ai = {});
            (_a = c.ai).gemini ?? (_a.gemini = {});
            c.ai.gemini.apiKey = process.env['GEMINI_API_KEY'];
        }
        if (process.env['OPENAI_API_KEY']) {
            c.ai ?? (c.ai = {});
            (_b = c.ai).openai ?? (_b.openai = {});
            c.ai.openai.apiKey = process.env['OPENAI_API_KEY'];
        }
        if (process.env['ANTHROPIC_API_KEY']) {
            c.ai ?? (c.ai = {});
            (_c = c.ai).claude ?? (_c.claude = {});
            c.ai.claude.apiKey = process.env['ANTHROPIC_API_KEY'];
        }
        if (process.env['OLLAMA_BASE_URL']) {
            c.ai ?? (c.ai = {});
            (_d = c.ai).ollama ?? (_d.ollama = {});
            c.ai.ollama.baseUrl = process.env['OLLAMA_BASE_URL'];
        }
        // Notification Providers
        if (process.env['TELEGRAM_BOT_TOKEN']) {
            c.notifications ?? (c.notifications = {});
            (_e = c.notifications).telegram ?? (_e.telegram = {});
            c.notifications.telegram.botToken = process.env['TELEGRAM_BOT_TOKEN'];
        }
        if (process.env['TELEGRAM_CHAT_ID']) {
            c.notifications ?? (c.notifications = {});
            (_f = c.notifications).telegram ?? (_f.telegram = {});
            c.notifications.telegram.chatId = process.env['TELEGRAM_CHAT_ID'];
        }
        if (process.env['DISCORD_WEBHOOK_URL']) {
            c.notifications ?? (c.notifications = {});
            (_g = c.notifications).discord ?? (_g.discord = {});
            c.notifications.discord.webhookUrl = process.env['DISCORD_WEBHOOK_URL'];
        }
        if (process.env['SLACK_WEBHOOK_URL']) {
            c.notifications ?? (c.notifications = {});
            (_h = c.notifications).slack ?? (_h.slack = {});
            c.notifications.slack.webhookUrl = process.env['SLACK_WEBHOOK_URL'];
        }
        // Email
        if (process.env['EMAIL_SMTP_HOST']) {
            c.notifications ?? (c.notifications = {});
            (_j = c.notifications).email ?? (_j.email = {});
            c.notifications.email.smtpHost = process.env['EMAIL_SMTP_HOST'];
        }
        if (process.env['EMAIL_SMTP_PORT']) {
            c.notifications ?? (c.notifications = {});
            (_k = c.notifications).email ?? (_k.email = {});
            c.notifications.email.smtpPort = parseInt(process.env['EMAIL_SMTP_PORT'], 10);
        }
        if (process.env['EMAIL_SMTP_USER']) {
            c.notifications ?? (c.notifications = {});
            (_l = c.notifications).email ?? (_l.email = {});
            c.notifications.email.smtpUser = process.env['EMAIL_SMTP_USER'];
        }
        if (process.env['EMAIL_SMTP_PASS']) {
            c.notifications ?? (c.notifications = {});
            (_m = c.notifications).email ?? (_m.email = {});
            c.notifications.email.smtpPass = process.env['EMAIL_SMTP_PASS'];
        }
        if (process.env['EMAIL_FROM']) {
            c.notifications ?? (c.notifications = {});
            (_o = c.notifications).email ?? (_o.email = {});
            c.notifications.email.from = process.env['EMAIL_FROM'];
        }
        // Storage
        if (process.env['AWS_ACCESS_KEY_ID']) {
            c.storage ?? (c.storage = {});
            (_p = c.storage).s3 ?? (_p.s3 = {});
            c.storage.s3.accessKeyId = process.env['AWS_ACCESS_KEY_ID'];
        }
        if (process.env['AWS_SECRET_ACCESS_KEY']) {
            c.storage ?? (c.storage = {});
            (_q = c.storage).s3 ?? (_q.s3 = {});
            c.storage.s3.secretAccessKey = process.env['AWS_SECRET_ACCESS_KEY'];
        }
        if (process.env['AWS_REGION']) {
            c.storage ?? (c.storage = {});
            (_r = c.storage).s3 ?? (_r.s3 = {});
            c.storage.s3.region = process.env['AWS_REGION'];
        }
        if (process.env['AWS_S3_BUCKET']) {
            c.storage ?? (c.storage = {});
            (_s = c.storage).s3 ?? (_s.s3 = {});
            c.storage.s3.bucket = process.env['AWS_S3_BUCKET'];
        }
        return c;
    }
}
exports.Config = Config;
exports.default = Config.getInstance();
//# sourceMappingURL=index.js.map