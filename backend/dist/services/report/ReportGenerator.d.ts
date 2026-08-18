import { ReportInput } from './ReportFormatter';
export declare class ReportGenerator {
    private analyzer;
    private formatter;
    constructor();
    generateReport(input: Omit<ReportInput, 'analysis'>): {
        html: string;
        markdown: string;
        title: string;
        analysisResult: any;
    };
}
//# sourceMappingURL=ReportGenerator.d.ts.map