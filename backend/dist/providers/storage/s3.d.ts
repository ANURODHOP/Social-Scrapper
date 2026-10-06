import { StorageProvider } from './base';
export interface S3StorageConfig {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
    /** Optional: custom endpoint for R2 / B2 / MinIO */
    endpoint?: string;
    /** Optional: base URL for generating public URLs (e.g. https://<bucket>.r2.dev) */
    publicBaseUrl?: string;
}
export declare class S3StorageProvider implements StorageProvider {
    private readonly client;
    private readonly bucket;
    private readonly publicBaseUrl?;
    constructor(config: S3StorageConfig);
    /**
     * Build a structured key for cloud storage:
     *   <provider>/<profile>/<postId>/<subPath>
     * Uses forward slashes regardless of OS.
     */
    buildStructuredPath(providerName: string, profileIdentifier: string, postId: string, subPath: string): string;
    upload(fileBuffer: Buffer, filePath: string): Promise<string>;
    download(filePath: string): Promise<Buffer>;
    delete(filePath: string): Promise<void>;
    exists(filePath: string): Promise<boolean>;
    private inferContentType;
    private streamToBuffer;
}
//# sourceMappingURL=s3.d.ts.map