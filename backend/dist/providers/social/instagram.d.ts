import { SocialProvider } from './base';
import { InstagramClient, RawInstagramProfile } from './instagram.client.interface';
export interface InstagramPostData {
    id: string;
    platform: 'instagram';
    caption?: string;
    mediaType: string;
    permalink: string;
    thumbnailUrl?: string;
    publishedAt: string;
    media: InstagramMediaItemData[];
}
export interface InstagramMediaItemData {
    downloadUrl?: string;
    mediaUrl?: string;
    type: string;
    width?: number;
    height?: number;
    duration?: number;
}
export declare class InstagramProvider implements SocialProvider {
    private readonly client;
    private static readonly PLATFORM;
    constructor(client: InstagramClient);
    authenticate(_credentials: unknown): Promise<unknown>;
    getProfile(identifier: string): Promise<RawInstagramProfile>;
    validateProfile(identifier: string): Promise<boolean>;
    /**
     * Discover all recent posts.
     * Returns all posts — deduplication happens in ScraperService.
     */
    discoverPosts(profileId: string, _since?: Date): Promise<InstagramPostData[]>;
    downloadMedia(mediaId: string): Promise<string | null>;
    extractMetadata(mediaId: string): Promise<unknown>;
}
//# sourceMappingURL=instagram.d.ts.map