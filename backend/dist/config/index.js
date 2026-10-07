"use strict";
// src/config/index.ts
// Centralized configuration loader.
// Priority (highest to lowest):
//   1. Environment variables
//   2. Environment-specific YAML (e.g., development.yaml, production.yaml)
//   3. Default YAML (default.yaml, if present)
//   4. Hardcoded defaults (always available, even in production dist builds)
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
/** Hardcoded defaults — mirrors src/config/default.yaml exactly.
 *  This ensures the config system works even when the YAML is not
 *  present in the dist folder (e.g. Vercel / Docker deployments). */
const HARDCODED_DEFAULTS = {
    nodeEnv: 'development',
    port: 8000,
    database: { url: 'file:./dev.db' },
    storage: { provider: 'local', local: { rootPath: './storage' } },
    scheduler: { profiles: { scrapeIntervalCron: '0 * * * *' }, concurrency: 2 },
    scraper: {
        rateLimits: { instagram: { requestsPerHour: 100, requestsPerDay: 1500 } },
        timeout: 30,
        retryAttempts: 3,
    },
    ai: {
        default: 'nvidia',
        nvidia: { apiKey: null, endpoint: 'https://integrate.api.nvidia.com/v1', model: 'meta/llama-3.1-70b-instruct' },
        gemini: { apiKey: null, model: 'gemini-1.5-pro' },
        openai: { apiKey: null, model: 'gpt-4o' },
        claude: { apiKey: null, model: 'claude-3-5-sonnet-20241022' },
        ollama: { baseUrl: 'http://localhost:11434', model: 'llama3' },
        openrouter: { apiKey: null, model: null },
    },
    notifications: {
        telegram: { botToken: null, chatId: null },
        discord: { webhookUrl: null },
        whatsapp: { accessToken: null, phoneNumberId: null },
        slack: { webhookUrl: null },
        email: { smtpHost: null, smtpPort: 587, smtpUser: null, smtpPass: null, from: null },
    },
    logging: { level: 'info', logsDir: './logs', maxSize: '20m', maxFiles: 14 },
    reports: { outputDir: './reports', templatesDir: './src/reports/templates' },
    paths: { storageRoot: './storage', tempDir: './temp', logsDir: './logs' },
    timeouts: { scraper: 30, mediaDownload: 60, mediaProcessing: 120, aiAnalysis: 60, reportGeneration: 30 },
    retryPolicy: { maxAttempts: 3, baseDelay: 1, maxDelay: 60, factor: 2 },
    frameSampling: { shortThreshold: 15, mediumThreshold: 45, shortInterval: 1, mediumInterval: 2, longInterval: 5, maxFrames: 12 },
};
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
        // Start from hardcoded defaults so production always has a full config.
        let config = this.deepMerge({}, HARDCODED_DEFAULTS);
        // Try to overlay with the YAML file (works in local dev and when copied correctly).
        // __dirname resolves to src/config/ (ts-node) or dist/config/ (compiled).
        const configDir = __dirname;
        const defaultYamlPath = path_1.default.join(configDir, 'default.yaml');
        if (fs_1.default.existsSync(defaultYamlPath)) {
            const yamlConfig = this.loadYamlFile(defaultYamlPath);
            config = this.deepMerge(config, yamlConfig);
        }
        else {
            console.info(`Config: default.yaml not found at ${defaultYamlPath} — using hardcoded defaults.`);
        }
        // Overlay with environment-specific YAML if present.
        const env = process.env['NODE_ENV'] ?? 'development';
        const envConfigPath = path_1.default.join(configDir, `${env}.yaml`);
        if (fs_1.default.existsSync(envConfigPath)) {
            const envConfig = this.loadYamlFile(envConfigPath);
            config = this.deepMerge(config, envConfig);
        }
        // Final override: environment variables take highest priority.
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
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
        if (process.env['NVIDIA_API_KEY']) {
            c.ai ?? (c.ai = {});
            (_a = c.ai).nvidia ?? (_a.nvidia = {});
            c.ai.nvidia.apiKey = process.env['NVIDIA_API_KEY'];
        }
        if (process.env['GEMINI_API_KEY']) {
            c.ai ?? (c.ai = {});
            (_b = c.ai).gemini ?? (_b.gemini = {});
            c.ai.gemini.apiKey = process.env['GEMINI_API_KEY'];
        }
        if (process.env['OPENAI_API_KEY']) {
            c.ai ?? (c.ai = {});
            (_c = c.ai).openai ?? (_c.openai = {});
            c.ai.openai.apiKey = process.env['OPENAI_API_KEY'];
        }
        if (process.env['ANTHROPIC_API_KEY']) {
            c.ai ?? (c.ai = {});
            (_d = c.ai).claude ?? (_d.claude = {});
            c.ai.claude.apiKey = process.env['ANTHROPIC_API_KEY'];
        }
        if (process.env['OLLAMA_BASE_URL']) {
            c.ai ?? (c.ai = {});
            (_e = c.ai).ollama ?? (_e.ollama = {});
            c.ai.ollama.baseUrl = process.env['OLLAMA_BASE_URL'];
        }
        if (process.env['OPENROUTER_API_KEY']) {
            c.ai ?? (c.ai = {});
            (_f = c.ai).openrouter ?? (_f.openrouter = {});
            c.ai.openrouter.apiKey = process.env['OPENROUTER_API_KEY'];
        }
        // Notification Providers
        if (process.env['TELEGRAM_BOT_TOKEN']) {
            c.notifications ?? (c.notifications = {});
            (_g = c.notifications).telegram ?? (_g.telegram = {});
            c.notifications.telegram.botToken = process.env['TELEGRAM_BOT_TOKEN'];
        }
        if (process.env['TELEGRAM_CHAT_ID']) {
            c.notifications ?? (c.notifications = {});
            (_h = c.notifications).telegram ?? (_h.telegram = {});
            c.notifications.telegram.chatId = process.env['TELEGRAM_CHAT_ID'];
        }
        if (process.env['DISCORD_WEBHOOK_URL']) {
            c.notifications ?? (c.notifications = {});
            (_j = c.notifications).discord ?? (_j.discord = {});
            c.notifications.discord.webhookUrl = process.env['DISCORD_WEBHOOK_URL'];
        }
        if (process.env['SLACK_WEBHOOK_URL']) {
            c.notifications ?? (c.notifications = {});
            (_k = c.notifications).slack ?? (_k.slack = {});
            c.notifications.slack.webhookUrl = process.env['SLACK_WEBHOOK_URL'];
        }
        // Email
        if (process.env['EMAIL_SMTP_HOST']) {
            c.notifications ?? (c.notifications = {});
            (_l = c.notifications).email ?? (_l.email = {});
            c.notifications.email.smtpHost = process.env['EMAIL_SMTP_HOST'];
        }
        if (process.env['EMAIL_SMTP_PORT']) {
            c.notifications ?? (c.notifications = {});
            (_m = c.notifications).email ?? (_m.email = {});
            c.notifications.email.smtpPort = parseInt(process.env['EMAIL_SMTP_PORT'], 10);
        }
        if (process.env['EMAIL_SMTP_USER']) {
            c.notifications ?? (c.notifications = {});
            (_o = c.notifications).email ?? (_o.email = {});
            c.notifications.email.smtpUser = process.env['EMAIL_SMTP_USER'];
        }
        if (process.env['EMAIL_SMTP_PASS']) {
            c.notifications ?? (c.notifications = {});
            (_p = c.notifications).email ?? (_p.email = {});
            c.notifications.email.smtpPass = process.env['EMAIL_SMTP_PASS'];
        }
        if (process.env['EMAIL_FROM']) {
            c.notifications ?? (c.notifications = {});
            (_q = c.notifications).email ?? (_q.email = {});
            c.notifications.email.from = process.env['EMAIL_FROM'];
        }
        // Storage — provider selection
        if (process.env['STORAGE_PROVIDER']) {
            c.storage ?? (c.storage = {});
            c.storage.provider = process.env['STORAGE_PROVIDER'];
        }
        // AWS S3
        if (process.env['AWS_ACCESS_KEY_ID']) {
            c.storage ?? (c.storage = {});
            (_r = c.storage).s3 ?? (_r.s3 = {});
            c.storage.s3.accessKeyId = process.env['AWS_ACCESS_KEY_ID'];
        }
        if (process.env['AWS_SECRET_ACCESS_KEY']) {
            c.storage ?? (c.storage = {});
            (_s = c.storage).s3 ?? (_s.s3 = {});
            c.storage.s3.secretAccessKey = process.env['AWS_SECRET_ACCESS_KEY'];
        }
        if (process.env['AWS_REGION']) {
            c.storage ?? (c.storage = {});
            (_t = c.storage).s3 ?? (_t.s3 = {});
            c.storage.s3.region = process.env['AWS_REGION'];
        }
        if (process.env['AWS_S3_BUCKET']) {
            c.storage ?? (c.storage = {});
            (_u = c.storage).s3 ?? (_u.s3 = {});
            c.storage.s3.bucket = process.env['AWS_S3_BUCKET'];
        }
        if (process.env['AWS_S3_ENDPOINT']) {
            c.storage ?? (c.storage = {});
            (_v = c.storage).s3 ?? (_v.s3 = {});
            c.storage.s3.endpoint = process.env['AWS_S3_ENDPOINT'];
        }
        // Cloudflare R2
        if (process.env['R2_ACCOUNT_ID']) {
            c.storage ?? (c.storage = {});
            (_w = c.storage).r2 ?? (_w.r2 = {});
            c.storage.r2.accountId = process.env['R2_ACCOUNT_ID'];
        }
        if (process.env['R2_ACCESS_KEY_ID']) {
            c.storage ?? (c.storage = {});
            (_x = c.storage).r2 ?? (_x.r2 = {});
            c.storage.r2.accessKeyId = process.env['R2_ACCESS_KEY_ID'];
        }
        if (process.env['R2_SECRET_ACCESS_KEY']) {
            c.storage ?? (c.storage = {});
            (_y = c.storage).r2 ?? (_y.r2 = {});
            c.storage.r2.secretAccessKey = process.env['R2_SECRET_ACCESS_KEY'];
        }
        if (process.env['R2_BUCKET']) {
            c.storage ?? (c.storage = {});
            (_z = c.storage).r2 ?? (_z.r2 = {});
            c.storage.r2.bucket = process.env['R2_BUCKET'];
        }
        return c;
    }
}
exports.Config = Config;
exports.default = Config.getInstance();
//# sourceMappingURL=index.js.map