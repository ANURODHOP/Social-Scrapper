import { Prisma } from '@prisma/client';
export declare class ReportRepository {
    create(data: Prisma.ReportUncheckedCreateInput): Promise<{
        format: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        profileId: string | null;
        type: string;
        title: string;
        content: string;
        filePath: string | null;
        generatedAt: Date;
        postId: string | null;
    }>;
    upsert(data: {
        postId?: string;
        profileId?: string;
        type: string;
        format: string;
        title: string;
        content: string;
        filePath?: string;
    }): Promise<{
        format: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        profileId: string | null;
        type: string;
        title: string;
        content: string;
        filePath: string | null;
        generatedAt: Date;
        postId: string | null;
    }>;
    findById(id: string): Promise<{
        format: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        profileId: string | null;
        type: string;
        title: string;
        content: string;
        filePath: string | null;
        generatedAt: Date;
        postId: string | null;
    } | null>;
    findByPostId(postId: string): Promise<{
        format: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        profileId: string | null;
        type: string;
        title: string;
        content: string;
        filePath: string | null;
        generatedAt: Date;
        postId: string | null;
    }[]>;
    findByProfileId(profileId: string): Promise<{
        format: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        profileId: string | null;
        type: string;
        title: string;
        content: string;
        filePath: string | null;
        generatedAt: Date;
        postId: string | null;
    }[]>;
    findAll(limit?: number): Promise<{
        format: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        profileId: string | null;
        type: string;
        title: string;
        content: string;
        filePath: string | null;
        generatedAt: Date;
        postId: string | null;
    }[]>;
}
//# sourceMappingURL=report.repository.d.ts.map