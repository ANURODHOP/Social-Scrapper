import { SocialProvider } from '../providers/social/base';
import { StorageProvider } from '../providers/storage/base';
import { IJobQueue } from '../jobs/IJobQueue';
import { ProfileRepository } from '../repositories/profile.repository';
import { PostRepository } from '../repositories/post.repository';
import { MediaRepository } from '../repositories/media.repository';
export declare class ScraperService {
    private readonly socialProvider;
    private readonly storageProvider;
    private readonly profileRepo;
    private readonly postRepo;
    private readonly mediaRepo;
    private readonly jobQueue;
    constructor(socialProvider: SocialProvider, storageProvider: StorageProvider, profileRepo: ProfileRepository, postRepo: PostRepository, mediaRepo: MediaRepository, jobQueue: IJobQueue);
    /**
     * Scrape a profile for new posts.
     * Every execution compares fetched posts against existing posts in Firestore.
     * Only posts not already present are created.
     */
    scrapeProfile(profileId: string): Promise<void>;
    private createPost;
    private processMediaItem;
    private downloadMedia;
}
//# sourceMappingURL=scraper.service.d.ts.map