// src/services/scraper.service.ts
import { SocialProvider } from '../providers/social/base';
import { StorageProvider } from '../providers/storage/base';
import { IJobQueue } from '../jobs/IJobQueue';
import { ProfileRepository } from '../repositories/profile.repository';
import { PostRepository } from '../repositories/post.repository';
import { MediaRepository } from '../repositories/media.repository';
import logger from '../logger';

interface PostData {
  id: string;
  platform: string;
  caption?: string;
  mediaType: string;
  permalink?: string;
  thumbnailUrl?: string;
  publishedAt?: string | Date;
  media?: MediaItemData[];
  mediaUrl?: string;
}

interface MediaItemData {
  downloadUrl?: string;
  mediaUrl?: string;
  type?: string;
  mediaType?: string;
  width?: number;
  height?: number;
  duration?: number;
}

export class ScraperService {
  private readonly socialProvider: SocialProvider;
  private readonly storageProvider: StorageProvider;
  private readonly profileRepo: ProfileRepository;
  private readonly postRepo: PostRepository;
  private readonly mediaRepo: MediaRepository;
  private readonly jobQueue: IJobQueue;

  constructor(
    socialProvider: SocialProvider,
    storageProvider: StorageProvider,
    profileRepo: ProfileRepository,
    postRepo: PostRepository,
    mediaRepo: MediaRepository,
    jobQueue: IJobQueue
  ) {
    this.socialProvider = socialProvider;
    this.storageProvider = storageProvider;
    this.profileRepo = profileRepo;
    this.postRepo = postRepo;
    this.mediaRepo = mediaRepo;
    this.jobQueue = jobQueue;
  }

  /**
   * Scrape a profile for new posts.
   * Every execution compares fetched posts against existing posts in Firestore.
   * Only posts not already present are created.
   */
  async scrapeProfile(profileId: string): Promise<void> {
    const profile = await this.profileRepo.findById(profileId);

    if (!profile) {
      throw new Error(`Profile not found: ${profileId}`);
    }

    logger.info(`ScraperService: scraping profile ${profile.username} (${profile.platform})`);

    // Discover all available posts
    const posts = await this.socialProvider.discoverPosts(profile.platformId);

    logger.info(`ScraperService: discovered ${posts.length} posts for ${profile.username}`);

    let newCount = 0;
    for (const postData of posts as PostData[]) {
      // Existence check by platform + platformId
      const existing = await this.postRepo.findByPlatformAndId(profile.platform, postData.id);

      if (existing) {
        // Already in database — skip
        continue;
      }

      await this.createPost(profile.id, profile.platform, postData);
      newCount++;
    }

    logger.info(`ScraperService: created ${newCount} new posts for ${profile.username}`);
  }

  private async createPost(
    profileId: string,
    platform: string,
    postData: PostData
  ): Promise<void> {
    const post = await this.postRepo.create({
      platform,
      platformId: postData.id,
      profileId,
      caption: postData.caption,
      mediaType: postData.mediaType,
      permalink: postData.permalink,
      thumbnailUrl: postData.thumbnailUrl,
      publishedAt: postData.publishedAt
        ? new Date(postData.publishedAt)
        : new Date(),
    });

    logger.info(`ScraperService: created post ${post.id} (platformId=${postData.id})`);

    // Download and store associated media
    const mediaItems: MediaItemData[] = postData.media ?? [];
    if (postData.mediaUrl) {
      mediaItems.push({ downloadUrl: postData.mediaUrl, type: postData.mediaType });
    }

    for (const mediaItem of mediaItems) {
      await this.processMediaItem(post.id, mediaItem);
    }
  }

  private async processMediaItem(postId: string, mediaItem: MediaItemData): Promise<void> {
    const mediaBuffer = await this.downloadMedia(mediaItem);
    if (!mediaBuffer) {
      logger.warn(`ScraperService: skipping media for post ${postId} — no download URL`);
      return;
    }

    const mediaType = mediaItem.type ?? mediaItem.mediaType ?? 'IMAGE';
    const extension = mediaType.toUpperCase() === 'VIDEO' ? 'mp4' : 'jpg';
    const timestamp = Date.now();
    const filePath = `media/${postId}/${timestamp}.${extension}`;

    const storedPath = await this.storageProvider.upload(mediaBuffer, filePath);

    const media = await this.mediaRepo.createMedia({
      postId,
      mediaUrl: storedPath,
      mediaType,
      width: mediaItem.width,
      height: mediaItem.height,
      duration: mediaItem.duration,
      fileSize: mediaBuffer.length,
    });

    await this.mediaRepo.createMediaFile({
      mediaId: media.id,
      fileType: 'original',
      filePath: storedPath,
      fileSize: mediaBuffer.length,
      width: mediaItem.width,
      height: mediaItem.height,
      duration: mediaItem.duration,
    });

    // Enqueue for processing pipeline
    await this.jobQueue.add('process-media', {
      mediaId: media.id,
      filePath: storedPath,
      mediaType,
    });

    logger.info(`ScraperService: stored media ${media.id} → ${storedPath}`);
  }

  private async downloadMedia(mediaItem: MediaItemData): Promise<Buffer | null> {
    const url = mediaItem.downloadUrl ?? mediaItem.mediaUrl;
    if (!url) return null;

    const response = await fetch(url);
    if (!response.ok) {
      logger.error(`ScraperService: failed to download media — HTTP ${response.status} ${response.statusText}`, { url });
      return null;
    }
    return Buffer.from(await response.arrayBuffer());
  }
}