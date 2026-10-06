"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService = void 0;
const logger_1 = __importDefault(require("../logger"));
class ScraperService {
    constructor(socialProvider, storageProvider, profileRepo, postRepo, mediaRepo, jobQueue) {
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
    async scrapeProfile(profileId) {
        const profile = await this.profileRepo.findById(profileId);
        if (!profile) {
            throw new Error(`Profile not found: ${profileId}`);
        }
        logger_1.default.info(`ScraperService: scraping profile ${profile.username} (${profile.platform})`);
        // Discover all available posts
        const posts = await this.socialProvider.discoverPosts(profile.platformId);
        logger_1.default.info(`ScraperService: discovered ${posts.length} posts for ${profile.username}`);
        let newCount = 0;
        for (const postData of posts) {
            // Existence check by platform + platformId
            const existing = await this.postRepo.findByPlatformAndId(profile.platform, postData.id);
            if (existing) {
                // Already in database — skip
                continue;
            }
            await this.createPost(profile.id, profile.platform, postData);
            newCount++;
        }
        logger_1.default.info(`ScraperService: created ${newCount} new posts for ${profile.username}`);
    }
    async createPost(profileId, platform, postData) {
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
        logger_1.default.info(`ScraperService: created post ${post.id} (platformId=${postData.id})`);
        // Download and store associated media
        const mediaItems = postData.media ?? [];
        if (postData.mediaUrl) {
            mediaItems.push({ downloadUrl: postData.mediaUrl, type: postData.mediaType });
        }
        for (const mediaItem of mediaItems) {
            await this.processMediaItem(post.id, mediaItem);
        }
    }
    async processMediaItem(postId, mediaItem) {
        const mediaBuffer = await this.downloadMedia(mediaItem);
        if (!mediaBuffer) {
            logger_1.default.warn(`ScraperService: skipping media for post ${postId} — no download URL`);
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
        logger_1.default.info(`ScraperService: stored media ${media.id} → ${storedPath}`);
    }
    async downloadMedia(mediaItem) {
        const url = mediaItem.downloadUrl ?? mediaItem.mediaUrl;
        if (!url)
            return null;
        const response = await fetch(url);
        if (!response.ok) {
            logger_1.default.error(`ScraperService: failed to download media — HTTP ${response.status} ${response.statusText}`, { url });
            return null;
        }
        return Buffer.from(await response.arrayBuffer());
    }
}
exports.ScraperService = ScraperService;
//# sourceMappingURL=scraper.service.js.map