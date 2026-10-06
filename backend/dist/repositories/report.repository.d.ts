export interface ReportDoc {
    id: string;
    postId?: string | null;
    profileId?: string | null;
    type: string;
    format: string;
    title: string;
    content: string;
    filePath?: string | null;
    generatedAt: Date;
}
export declare class ReportRepository {
    create(data: Omit<ReportDoc, 'id' | 'generatedAt'>): Promise<ReportDoc>;
    upsert(data: {
        postId?: string;
        profileId?: string;
        type: string;
        format: string;
        title: string;
        content: string;
        filePath?: string;
    }): Promise<ReportDoc>;
    findById(id: string): Promise<ReportDoc | null>;
    findByPostId(postId: string): Promise<ReportDoc[]>;
    findByProfileId(profileId: string): Promise<ReportDoc[]>;
    findAll(limitCount?: number): Promise<ReportDoc[]>;
}
//# sourceMappingURL=report.repository.d.ts.map