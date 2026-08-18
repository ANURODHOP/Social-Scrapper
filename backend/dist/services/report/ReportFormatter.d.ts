import { DeterministicAnalysisResult } from './ReportAnalyzer';
export interface ReportInput {
    analysis: DeterministicAnalysisResult;
    caption: string | null;
    username: string | null;
    platform: string;
    permalink: string;
    publishedAt: Date | null;
    frames: string[];
}
export declare class ReportFormatter {
    formatHtml(input: ReportInput): string;
}
//# sourceMappingURL=ReportFormatter.d.ts.map