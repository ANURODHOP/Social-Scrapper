export interface AnalysisDoc {
    id: string;
    postId: string;
    summary?: string | null;
    topics?: string[] | null;
    sentiment?: string | null;
    viralScore?: number | null;
    visualHook?: string | null;
    keyTakeaways?: string[] | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AnalysisRepository {
    create(data: Omit<AnalysisDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnalysisDoc>;
    update(id: string, data: Partial<Omit<AnalysisDoc, 'id'>>): Promise<AnalysisDoc>;
    findByPostId(postId: string): Promise<AnalysisDoc | null>;
    findById(id: string): Promise<AnalysisDoc | null>;
    deleteByPostId(postId: string): Promise<void>;
}
//# sourceMappingURL=analysis.repository.d.ts.map