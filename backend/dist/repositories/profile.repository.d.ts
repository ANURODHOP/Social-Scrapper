/** Shape that callers and the rest of the app expect */
export interface ProfileDoc {
    id: string;
    platform: string;
    platformId: string;
    username: string;
    displayName?: string | null;
    bio?: string | null;
    followerCount?: number | null;
    followingCount?: number | null;
    profilePicUrl?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
export declare class ProfileRepository {
    findAll(): Promise<ProfileDoc[]>;
    findAllMonitored(): Promise<ProfileDoc[]>;
    findById(id: string): Promise<ProfileDoc | null>;
    findByPlatformAndId(platform: string, platformId: string): Promise<ProfileDoc | null>;
    findByUsername(platform: string, username: string): Promise<ProfileDoc | null>;
    create(data: Omit<ProfileDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProfileDoc>;
    update(id: string, data: Partial<Omit<ProfileDoc, 'id'>>): Promise<ProfileDoc>;
    softDelete(id: string): Promise<ProfileDoc>;
    count(): Promise<number>;
}
//# sourceMappingURL=profile.repository.d.ts.map