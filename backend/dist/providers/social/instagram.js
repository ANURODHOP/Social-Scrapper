"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramProvider = void 0;
const logger_1 = __importDefault(require("../../logger"));
function mapMediaType(raw) {
    const typeMap = {
        IMAGE: 'IMAGE',
        VIDEO: 'VIDEO',
        CAROUSEL_ALBUM: 'CAROUSEL_ALBUM',
    };
    return typeMap[raw] ?? raw;
}
function flattenMedia(rawPost) {
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
class InstagramProvider {
    constructor(client) {
        this.client = client;
        logger_1.default.info('InstagramProvider: initialized');
    }
    async authenticate(_credentials) {
        // Authentication is the responsibility of the concrete InstagramClient.
        // This method exists only to satisfy the SocialProvider interface.
        logger_1.default.debug('InstagramProvider.authenticate: delegated to client');
        return {};
    }
    async getProfile(identifier) {
        logger_1.default.info(`InstagramProvider.getProfile: ${identifier}`);
        return this.client.getProfile(identifier);
    }
    async validateProfile(identifier) {
        logger_1.default.info(`InstagramProvider.validateProfile: ${identifier}`);
        try {
            return await this.client.validateProfile(identifier);
        }
        catch (err) {
            logger_1.default.error('InstagramProvider.validateProfile: error', { identifier, error: err });
            return false;
        }
    }
    /**
     * Discover all recent posts.
     * Returns all posts — deduplication happens in ScraperService.
     */
    async discoverPosts(profileId, _since) {
        logger_1.default.info(`InstagramProvider.discoverPosts: profile ${profileId}`);
        const rawMedia = await this.client.getRecentMedia(profileId, 50);
        return rawMedia.map((item) => ({
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
    async downloadMedia(mediaId) {
        logger_1.default.info(`InstagramProvider.downloadMedia: mediaId=${mediaId}`);
        return this.client.getMediaDownloadUrl(mediaId);
    }
    async extractMetadata(mediaId) {
        logger_1.default.info(`InstagramProvider.extractMetadata: mediaId=${mediaId}`);
        // Metadata is included in the getRecentMedia response.
        // This method is available if caller needs ad-hoc metadata for a known post.
        throw new Error('InstagramProvider.extractMetadata: use getProfile/discoverPosts for metadata collection');
    }
}
exports.InstagramProvider = InstagramProvider;
InstagramProvider.PLATFORM = 'instagram';
//# sourceMappingURL=instagram.js.map