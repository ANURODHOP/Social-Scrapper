import { Prisma } from '@prisma/client';
export declare class MediaRepository {
    createMedia(data: Prisma.MediaUncheckedCreateInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        mediaType: string;
        postId: string;
        mediaUrl: string;
        width: number | null;
        height: number | null;
        duration: number | null;
        fileSize: number | null;
    }>;
    createMediaFile(data: Prisma.MediaFilesUncheckedCreateInput): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        filePath: string;
        width: number | null;
        height: number | null;
        duration: number | null;
        fileSize: number | null;
        fileType: string;
        mediaId: string;
    }>;
    getMediaForPost(postId: string): Promise<({
        mediaFiles: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            filePath: string;
            width: number | null;
            height: number | null;
            duration: number | null;
            fileSize: number | null;
            fileType: string;
            mediaId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        mediaType: string;
        postId: string;
        mediaUrl: string;
        width: number | null;
        height: number | null;
        duration: number | null;
        fileSize: number | null;
    })[]>;
}
//# sourceMappingURL=media.repository.d.ts.map