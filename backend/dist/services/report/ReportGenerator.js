"use strict";
// src/services/report/ReportGenerator.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGenerator = void 0;
const ReportAnalyzer_1 = require("./ReportAnalyzer");
const ReportFormatter_1 = require("./ReportFormatter");
const logger_1 = __importDefault(require("../../logger"));
class ReportGenerator {
    constructor() {
        this.analyzer = new ReportAnalyzer_1.ReportAnalyzer();
        this.formatter = new ReportFormatter_1.ReportFormatter();
    }
    generateReport(input) {
        logger_1.default.info(`[REPORT] Starting deterministic report generation for ${input.permalink}`);
        // Analyze
        const analysis = this.analyzer.analyze(input.caption, input.username);
        logger_1.default.info(`[REPORT] Detected strategies: ${analysis.marketingStrategy.join(', ')}`);
        logger_1.default.info(`[REPORT] Detected CTA: ${analysis.callToAction}`);
        // Format
        const fullInput = {
            ...input,
            analysis
        };
        const html = this.formatter.formatHtml(fullInput);
        // A simple markdown fallback
        const markdown = `
# INSTAGRAM CONTENT INTELLIGENCE

**Account:** @${input.username || 'Unknown'}
**Platform:** ${input.platform}
**Post URL:** ${input.permalink}

## CONTENT SIGNALS
**Brand:** ${analysis.brand}
**Category:** ${analysis.category.join(', ')}
**Marketing Strategy:** ${analysis.marketingStrategy.join(', ')}
**Hook:** ${analysis.hook}
**Call To Action:** ${analysis.callToAction}
**Promotional Signals:** ${analysis.promotions.join(', ')}
**Urgency Signals:** ${analysis.urgency.join(', ')}
    `.trim();
        return {
            html,
            markdown,
            title: `Deterministic Report: ${input.username || 'Unknown'}`,
            analysisResult: analysis
        };
    }
}
exports.ReportGenerator = ReportGenerator;
//# sourceMappingURL=ReportGenerator.js.map