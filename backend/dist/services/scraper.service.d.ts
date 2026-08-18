import { SocialProvider } from '../providers/social/base';
import { PrismaClient } from '@prisma/client';
import { StorageProvider } from '../providers/storage/base';
import { IJobQueue } from '../jobs/IJobQueue';
export declare class ScraperService {
    private readonly socialProvider;
    private readonly storageProvider;
    private readonly prisma;
    private readonly jobQueue;
    constructor(socialProvider: SocialProvider, storageProvider: StorageProvider, prisma: PrismaClient, jobQueue: IJobQueue);
    /**
     * Scrape a profile for new posts.
     * Every execution compares fetched posts against the Posts table using the
     * unique (platform, platformId) constraint. Only posts not already present
     * are created. This prevents duplicates regardless of the "since" timestamp.
     */
    scrapeProfile(profileId: string): Promise<void>;
    private createPost;
    private processMediaItem;
    private downloadMedia;
}
//# sourceMappingURL=scraper.service.d.ts.map