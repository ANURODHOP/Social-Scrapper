export interface DatabaseConfig {
    url: string;
}
export interface StorageConfig {
    provider: 'local' | 's3' | 'r2' | 'azure' | 'gcs';
    local?: {
        rootPath: string;
    };
    s3?: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
        bucket: string;
        endpoint?: string;
    };
    r2?: {
        accountId: string;
        accessKeyId: string;
        secretAccessKey: string;
        bucket: string;
    };
    azure?: {
        accountName: string;
        accountKey: string;
        container: string;
    };
    gcs?: {
        projectId: string;
        keyFilename: string;
        bucket: string;
    };
}
export interface SchedulerConfig {
    profiles: {
        scrapeIntervalCron: string;
    };
    concurrency?: number;
}
export interface FrameSamplingConfig {
    shortThreshold: number;
    mediumThreshold: number;
    shortInterval: number;
    mediumInterval: number;
    longInterval: number;
    maxFrames: number;
}
export interface ScraperConfig {
    rateLimits: {
        instagram: {
            requestsPerHour: number;
            requestsPerDay: number;
        };
    };
    timeout: number;
    retryAttempts: number;
}
export interface AIProviderConfig {
    default?: string;
    nvidia: {
        apiKey?: string;
        endpoint?: string;
        model?: string;
    };
    gemini: {
        apiKey?: string;
        model?: string;
    };
    openai: {
        apiKey?: string;
        model?: string;
    };
    claude: {
        apiKey?: string;
        model?: string;
    };
    ollama: {
        baseUrl?: string;
        model?: string;
    };
    openrouter: {
        apiKey?: string;
        model?: string;
    };
}
export interface NotificationProviderConfig {
    telegram: {
        botToken?: string;
        chatId?: string;
    };
    discord: {
        webhookUrl?: string;
    };
    whatsapp: {
        accessToken?: string;
        phoneNumberId?: string;
    };
    slack: {
        webhookUrl?: string;
    };
    email: {
        smtpHost?: string;
        smtpPort?: number;
        smtpUser?: string;
        smtpPass?: string;
        from?: string;
    };
}
export interface LoggingConfig {
    level: string;
    logsDir?: string;
    maxSize: string;
    maxFiles: number;
}
export interface ReportsConfig {
    outputDir: string;
    templatesDir: string;
}
export interface PathsConfig {
    storageRoot: string;
    tempDir: string;
    logsDir: string;
}
export interface TimeoutPolicyConfig {
    scraper: number;
    mediaDownload: number;
    mediaProcessing: number;
    aiAnalysis: number;
    reportGeneration: number;
}
export interface RetryPolicyConfig {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
    factor: number;
}
export interface AppConfig {
    nodeEnv: string;
    port: number;
    database: DatabaseConfig;
    storage: StorageConfig;
    scheduler: SchedulerConfig;
    scraper: ScraperConfig;
    ai: AIProviderConfig;
    notifications: NotificationProviderConfig;
    logging: LoggingConfig;
    reports: ReportsConfig;
    paths: PathsConfig;
    timeouts: TimeoutPolicyConfig;
    retryPolicy: RetryPolicyConfig;
    frameSampling: FrameSamplingConfig;
}
//# sourceMappingURL=schema.d.ts.map