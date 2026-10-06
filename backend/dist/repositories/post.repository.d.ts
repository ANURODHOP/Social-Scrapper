export interface PostDoc {
    id: string;
    platform: string;
    platformId: string;
    profileId: string;
    caption?: string | null;
    mediaType: string;
    permalink?: string | null;
    thumbnailUrl?: string | null;
    publishedAt: Date;
    collectedAt: Date;
    isProcessed: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
export declare class PostRepository {
    findById(id: string): Promise<PostDoc | null>;
    findByProfileId(profileId: string): Promise<PostDoc[]>;
    findByPlatformAndId(platform: string, platformId: string): Promise<PostDoc | null>;
    create(data: Omit<PostDoc, 'id' | 'createdAt' | 'updatedAt' | 'collectedAt' | 'isProcessed'>): Promise<PostDoc>;
    update(id: string, data: Partial<Omit<PostDoc, 'id'>>): Promise<PostDoc>;
    getUnprocessedPosts(profileId?: string): Promise<PostDoc[]>;
    countForProfile(profileId: string): Promise<number>;
    findAll(limitCount?: number): Promise<PostDoc[]>;
}
//# sourceMappingURL=post.repository.d.ts.map