import { StorageProvider } from './base';
import { StorageConfig } from '../../config/schema';
/**
 * Create and return the storage provider configured in the app config.
 * Falls back to LocalStorageProvider if no cloud config is detected.
 */
export declare function createStorageProvider(config: StorageConfig): StorageProvider & {
    buildStructuredPath(provider: string, profile: string, postId: string, sub: string): string;
};
//# sourceMappingURL=factory.d.ts.map