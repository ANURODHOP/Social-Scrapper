import { StorageProvider } from './base';
export declare class LocalStorageProvider implements StorageProvider {
    private readonly rootPath;
    constructor(rootPath?: string);
    /**
     * Helper to build a canonical path: storage/<provider>/<profile>/<postId>/<filename>
     */
    buildStructuredPath(providerName: string, profileIdentifier: string, postId: string, subPath: string): string;
    private getFullPath;
    upload(fileBuffer: Buffer, filePath: string): Promise<string>;
    download(filePath: string): Promise<Buffer>;
    delete(filePath: string): Promise<void>;
    exists(filePath: string): Promise<boolean>;
}
//# sourceMappingURL=local.d.ts.map