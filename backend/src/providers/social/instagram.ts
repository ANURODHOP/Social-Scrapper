// src/providers/social/instagram.ts
// Instagram implementation of SocialProvider.
//
// IMPORTANT: This class does NOT depend on any concrete acquisition method.
// It depends solely on the InstagramClient interface.
// Inject a concrete InstagramClient implementation at construction time.
//
// Deduplication strategy:
//   The provider returns all available posts.
//   The ScraperService checks each post against the database using the
//   UNIQUE constraint on (platform, platformId) and creates only new entries.
//   We never rely on a "last seen" timestamp as the sole dedup mechanism.

import { SocialProvider } from './base';
import { InstagramClient, RawInstagramMedia, RawInstagramProfile } from './instagram.client.interface';
import logger from '../../logger';

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

function mapMediaType(raw: string): string {
  const typeMap: Record<string, string> = {
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    CAROUSEL_ALBUM: 'CAROUSEL_ALBUM',
  };
  return typeMap[raw] ?? raw;
}

function flattenMedia(rawPost: RawInstagramMedia): InstagramMediaItemData[] {
  if (rawPost.media_type === 'CAROUSEL_ALBUM' && rawPost.children?.length) {
    return rawPost.children.map((child) => ({
      downloadUrl: child.media_url,
      mediaUrl: child.media_url,
      type: mapMediaType(child.media_type),
    }));
  }
  return [{
    downloadUrl: rawPost.media_url,
    mediaUrl: rawPost.media_url,
    type: mapMediaType(rawPost.media_type),
  }];
}

export class InstagramProvider implements SocialProvider {
  private readonly client: InstagramClient;
  private static readonly PLATFORM = 'instagram';

  constructor(client: InstagramClient) {
    this.client = client;
    logger.info('InstagramProvider: initialized');
  }

  async authenticate(_credentials: unknown): Promise<unknown> {
    // Authentication is the responsibility of the concrete InstagramClient.
    // This method exists only to satisfy the SocialProvider interface.
    logger.debug('InstagramProvider.authenticate: delegated to client');
    return {};
  }

  async getProfile(identifier: string): Promise<RawInstagramProfile> {
    logger.info(`InstagramProvider.getProfile: ${identifier}`);
    return this.client.getProfile(identifier);
  }

  async validateProfile(identifier: string): Promise<boolean> {
    logger.info(`InstagramProvider.validateProfile: ${identifier}`);
    try {
      return await this.client.validateProfile(identifier);
    } catch (err) {
      logger.error('InstagramProvider.validateProfile: error', { identifier, error: err });
      return false;
    }
  }

  /**
   * Discover all recent posts.
   * Returns all posts — deduplication happens in ScraperService.
   */
  async discoverPosts(profileId: string, _since?: Date): Promise<InstagramPostData[]> {
    logger.info(`InstagramProvider.discoverPosts: profile ${profileId}`);
    const rawMedia = await this.client.getRecentMedia(profileId, 50);

    return rawMedia.map((item): InstagramPostData => ({
      id: item.id,
      platform: InstagramProvider.PLATFORM,
      caption: item.caption,
      mediaType: mapMediaType(item.media_type),
      permalink: item.permalink,
      thumbnailUrl: item.thumbnail_url,
      publishedAt: item.timestamp,
      media: flattenMedia(item),
    }));
  }

  async downloadMedia(mediaId: string): Promise<string | null> {
    logger.info(`InstagramProvider.downloadMedia: mediaId=${mediaId}`);
    return this.client.getMediaDownloadUrl(mediaId);
  }

  async extractMetadata(mediaId: string): Promise<unknown> {
    logger.info(`InstagramProvider.extractMetadata: mediaId=${mediaId}`);
    // Metadata is included in the getRecentMedia response.
    // This method is available if caller needs ad-hoc metadata for a known post.
    throw new Error('InstagramProvider.extractMetadata: use getProfile/discoverPosts for metadata collection');
  }
}