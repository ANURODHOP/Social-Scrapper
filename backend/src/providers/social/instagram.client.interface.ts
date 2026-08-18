// src/providers/social/instagram.client.interface.ts
// Abstraction over how Instagram data is actually acquired.
// The InstagramProvider depends ONLY on this interface.
//
// Concrete implementations:
//   - InstagramGraphApiClient   (official Graph API — requires approved app)
//   - InstagramInstatusClient   (third-party API wrapper)
//   - InstagramPlaywrightClient (browser automation — for authorized accounts)
//
// Implement a concrete client and inject it into InstagramProvider.

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
  media_url?: string;           // direct downloadable URL
  thumbnail_url?: string;       // for video posts
  permalink: string;            // canonical URL on instagram.com
  caption?: string;
  timestamp: string;            // ISO 8601
  children?: RawInstagramMedia[]; // for carousel albums
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
