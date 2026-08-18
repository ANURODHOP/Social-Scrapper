// src/config/index.ts
// Centralized configuration loader.
// Priority (highest to lowest):
//   1. Environment variables
//   2. Environment-specific YAML (e.g., development.yaml, production.yaml)
//   3. Default YAML (default.yaml)
//
// NOTE: dotenv must be loaded BEFORE this module is imported.
// Ensure `import 'dotenv/config'` is the first line of server.ts.

import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { AppConfig } from './schema';

export class Config {
  private static instance: Config;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public get<T extends keyof AppConfig>(key: T): AppConfig[T] {
    return this.config[key];
  }

  private loadConfig(): AppConfig {
    // __dirname resolves correctly both in ts-node (src/config/) and after tsc (dist/config/)
    const configDir = __dirname;

    let config = this.loadYamlFile(path.join(configDir, 'default.yaml'));

    const env = process.env['NODE_ENV'] ?? 'development';
    const envConfigPath = path.join(configDir, `${env}.yaml`);
    if (fs.existsSync(envConfigPath)) {
      const envConfig = this.loadYamlFile(envConfigPath);
      config = this.deepMerge(config, envConfig);
    }

    config = this.overrideWithEnv(config);
    return config as unknown as AppConfig;
  }

  private loadYamlFile(filePath: string): Record<string, unknown> {
    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const parsed = yaml.load(fileContents);
      return (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;
    } catch (error) {
      // During first run, the file may not yet exist
      console.warn(`Config: could not load ${filePath}:`, (error as Error).message);
      return {};
    }
  }

  private deepMerge(
    target: Record<string, unknown>,
    source: Record<string, unknown>
  ): Record<string, unknown> {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      const sv = source[key];
      const tv = target[key];
      if (sv !== null && typeof sv === 'object' && !Array.isArray(sv) &&
          tv !== null && typeof tv === 'object' && !Array.isArray(tv)) {
        result[key] = this.deepMerge(
          tv as Record<string, unknown>,
          sv as Record<string, unknown>
        );
      } else {
        result[key] = sv;
      }
    }
    return result;
  }

  private overrideWithEnv(config: Record<string, unknown>): Record<string, unknown> {
    const c = config as any;

    // Database
    if (process.env['DATABASE_URL']) {
      c.database ??= {};
      c.database.url = process.env['DATABASE_URL'];
    }

    // Server
    if (process.env['PORT']) c.port = parseInt(process.env['PORT']!, 10);
    if (process.env['NODE_ENV']) c.nodeEnv = process.env['NODE_ENV'];

    // AI Providers
    if (process.env['GEMINI_API_KEY'])   { c.ai ??= {}; c.ai.gemini ??= {}; c.ai.gemini.apiKey = process.env['GEMINI_API_KEY']; }
    if (process.env['OPENAI_API_KEY'])   { c.ai ??= {}; c.ai.openai ??= {}; c.ai.openai.apiKey = process.env['OPENAI_API_KEY']; }
    if (process.env['ANTHROPIC_API_KEY'])  { c.ai ??= {}; c.ai.claude ??= {}; c.ai.claude.apiKey = process.env['ANTHROPIC_API_KEY']; }
    if (process.env['OLLAMA_BASE_URL'])  { c.ai ??= {}; c.ai.ollama ??= {}; c.ai.ollama.baseUrl = process.env['OLLAMA_BASE_URL']; }

    // Notification Providers
    if (process.env['TELEGRAM_BOT_TOKEN']) { c.notifications ??= {}; c.notifications.telegram ??= {}; c.notifications.telegram.botToken = process.env['TELEGRAM_BOT_TOKEN']; }
    if (process.env['TELEGRAM_CHAT_ID'])   { c.notifications ??= {}; c.notifications.telegram ??= {}; c.notifications.telegram.chatId = process.env['TELEGRAM_CHAT_ID']; }
    if (process.env['DISCORD_WEBHOOK_URL']) { c.notifications ??= {}; c.notifications.discord ??= {}; c.notifications.discord.webhookUrl = process.env['DISCORD_WEBHOOK_URL']; }
    if (process.env['SLACK_WEBHOOK_URL'])   { c.notifications ??= {}; c.notifications.slack ??= {}; c.notifications.slack.webhookUrl = process.env['SLACK_WEBHOOK_URL']; }

    // Email
    if (process.env['EMAIL_SMTP_HOST']) { c.notifications ??= {}; c.notifications.email ??= {}; c.notifications.email.smtpHost = process.env['EMAIL_SMTP_HOST']; }
    if (process.env['EMAIL_SMTP_PORT']) { c.notifications ??= {}; c.notifications.email ??= {}; c.notifications.email.smtpPort = parseInt(process.env['EMAIL_SMTP_PORT']!, 10); }
    if (process.env['EMAIL_SMTP_USER']) { c.notifications ??= {}; c.notifications.email ??= {}; c.notifications.email.smtpUser = process.env['EMAIL_SMTP_USER']; }
    if (process.env['EMAIL_SMTP_PASS']) { c.notifications ??= {}; c.notifications.email ??= {}; c.notifications.email.smtpPass = process.env['EMAIL_SMTP_PASS']; }
    if (process.env['EMAIL_FROM'])      { c.notifications ??= {}; c.notifications.email ??= {}; c.notifications.email.from = process.env['EMAIL_FROM']; }

    // Storage
    if (process.env['AWS_ACCESS_KEY_ID'])     { c.storage ??= {}; c.storage.s3 ??= {}; c.storage.s3.accessKeyId = process.env['AWS_ACCESS_KEY_ID']; }
    if (process.env['AWS_SECRET_ACCESS_KEY']) { c.storage ??= {}; c.storage.s3 ??= {}; c.storage.s3.secretAccessKey = process.env['AWS_SECRET_ACCESS_KEY']; }
    if (process.env['AWS_REGION'])            { c.storage ??= {}; c.storage.s3 ??= {}; c.storage.s3.region = process.env['AWS_REGION']; }
    if (process.env['AWS_S3_BUCKET'])         { c.storage ??= {}; c.storage.s3 ??= {}; c.storage.s3.bucket = process.env['AWS_S3_BUCKET']; }

    return c;
  }
}

export default Config.getInstance();