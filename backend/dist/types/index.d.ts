export interface ApiSuccess<T> {
    success: true;
    data: T;
}
export interface ApiError {
    success: false;
    error: string;
    code?: string;
}
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
export declare function ok<T>(data: T): ApiSuccess<T>;
export declare function fail(error: string, code?: string): ApiError;
export interface AnalysisResult {
    productIdentification?: string;
    brand?: string;
    category?: string;
    campaign?: string;
    targetAudience?: string;
    marketingStrategy?: string;
    primaryMessage?: string;
    hook?: string;
    callToAction?: string;
    visualStyle?: string;
    colorPalette?: string[];
    emotion?: string;
    sceneDescriptions?: string[];
    objects?: string[];
    people?: string[];
    speechSummary?: string;
    captionSummary?: string;
    hashtags?: string[];
    keywords?: string[];
    competitorInsights?: Record<string, unknown>;
    postingStrategy?: string;
    overallConfidence?: number;
    rawMetadata?: Record<string, unknown>;
}
export interface ExtractedFrame {
    index: number;
    timestampSeconds: number;
    buffer: Buffer;
    width: number;
    height: number;
    sizeBytes: number;
}
export interface PipelineTelemetry {
    postId: string;
    profileUsername: string;
    platform: string;
    startedAt: Date;
    finishedAt?: Date;
    durationMs?: number;
    bytesDownloaded: number;
    framesExtracted: number;
    aiLatencyMs?: number;
    telegramLatencyMs?: number;
    retryCount: number;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map