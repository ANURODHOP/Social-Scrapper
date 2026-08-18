import { InstagramClient, RawInstagramMedia, RawInstagramProfile } from './instagram.client.interface';
export declare class InstagramHTTPClient implements InstagramClient {
    private readonly timeoutMs;
    constructor(timeoutSeconds?: number);
    getProfile(username: string): Promise<RawInstagramProfile>;
    validateProfile(username: string): Promise<boolean>;
    getRecentMedia(profileId: string, limit?: number): Promise<RawInstagramMedia[]>;
    getMediaDownloadUrl(mediaId: string): Promise<string | null>;
    private scrapeData;
    private mapEdgeToMedia;
}
//# sourceMappingURL=instagram.http.client.d.ts.map