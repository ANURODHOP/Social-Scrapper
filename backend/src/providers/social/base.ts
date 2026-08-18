// src/providers/social/base.ts
// SocialProvider — base interface for all social media data providers.
// All platform-specific providers (Instagram, TikTok, YouTube, etc.)
// must implement this interface.

export interface SocialProvider {
  /**
   * Authenticate with the platform (if applicable).
   * For providers that use token-based auth, this can be a no-op.
   */
  authenticate(credentials: unknown): Promise<unknown>;

  /**
   * Retrieve a profile by username or platform ID.
   */
  getProfile(identifier: string): Promise<unknown>;

  /**
   * Confirm a profile exists and is accessible.
   */
  validateProfile(identifier: string): Promise<boolean>;

  /**
   * Discover new posts for a profile.
   * The provider ALWAYS returns all available posts.
   * Deduplication is handled by ScraperService against the database.
   * The `since` parameter is optional and advisory only.
   */
  discoverPosts(profileId: string, since?: Date): Promise<unknown[]>;

  /**
   * Get a direct download URL for a specific media item.
   */
  downloadMedia(mediaId: string): Promise<unknown>;

  /**
   * Extract metadata for a specific post.
   */
  extractMetadata(postId: string): Promise<unknown>;
}