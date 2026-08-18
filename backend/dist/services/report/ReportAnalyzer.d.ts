export interface DeterministicAnalysisResult {
    marketingStrategy: string[];
    hook: string;
    primaryMessage: string;
    callToAction: string | null;
    promotions: string[];
    urgency: string[];
    engagementStrategy: string[];
    emotionalSignal: string;
    brand: string;
    category: string[];
    hashtags: {
        all: string[];
        branded: string[];
        campaign: string[];
        category: string[];
    };
    audience: string;
}
export declare class ReportAnalyzer {
    analyze(caption: string | null | undefined, username: string | null | undefined): DeterministicAnalysisResult;
    private detectStrategies;
    private detectHook;
    private detectPrimaryMessage;
    private detectCTA;
    private detectEmotion;
    private detectBrand;
    private detectCategory;
    private analyzeHashtags;
    private detectAudience;
    private hasAny;
    private extractMatches;
}
//# sourceMappingURL=ReportAnalyzer.d.ts.map