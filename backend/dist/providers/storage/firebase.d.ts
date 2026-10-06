import { StorageProvider } from './base';
export declare class FirebaseStorageProvider implements StorageProvider {
    /**
     * Build a structured object key:
     *   <provider>/<profile>/<postId>/<subPath>
     */
    buildStructuredPath(providerName: string, profileIdentifier: string, postId: string, subPath: string): string;
    upload(fileBuffer: Buffer, filePath: string): Promise<string>;
    download(filePath: string): Promise<Buffer>;
    delete(filePath: string): Promise<void>;
    exists(filePath: string): Promise<boolean>;
    private inferContentType;
}
//# sourceMappingURL=firebase.d.ts.map