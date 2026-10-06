export interface MediaDoc {
    id: string;
    postId: string;
    mediaUrl: string;
    mediaType: string;
    width?: number | null;
    height?: number | null;
    duration?: number | null;
    fileSize?: number | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    mediaFiles: MediaFileDoc[];
}
export interface MediaFileDoc {
    id: string;
    mediaId: string;
    fileType: string;
    filePath: string;
    fileSize?: number | null;
    width?: number | null;
    height?: number | null;
    duration?: number | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class MediaRepository {
    createMedia(data: Omit<MediaDoc, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'mediaFiles'>): Promise<MediaDoc>;
    createMediaFile(data: Omit<MediaFileDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaFileDoc>;
    getMediaForPost(postId: string): Promise<MediaDoc[]>;
}
//# sourceMappingURL=media.repository.d.ts.map