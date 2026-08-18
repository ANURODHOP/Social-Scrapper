export interface RawInstagramProfile {
    id: string;
    username: string;
    name?: string;
    biography?: string;
    followers_count?: number;
    following_count?: number;
    profile_picture_url?: string;
}
export interface RawInstagramMedia {
    id: string;
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    media_url?: string;
    thumbnail_url?: string;
    permalink: string;
    caption?: string;
    timestamp: string;
    children?: RawInstagramMedia[];
}
export interface InstagramClient {
    /**
     * Fetch profile metadata by username or platform ID.
     */
    getProfile(identifier: string): Promise<RawInstagramProfile>;
    /**
     * Confirm a profile is reachable and accessible.
     */
    validateProfile(identifier: string): Promise<boolean>;
    /**
     * Fetch the most recent posts for a profile.
     * @param profileId - Platform's profile ID
     * @param limit     - Maximum number of posts to return
     */
    getRecentMedia(profileId: string, limit?: number): Promise<RawInstagramMedia[]>;
    /**
     * Fetch a direct downloadable URL for a media item.
     * May be the same as media_url or require an extra API call.
     */
    getMediaDownloadUrl(mediaId: string): Promise<string | null>;
}
//# sourceMappingURL=instagram.client.interface.d.ts.map