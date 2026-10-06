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
        // A structured, publication-grade markdown fallback
        const markdown = `
# INSTAGRAM CONTENT INTELLIGENCE: @${input.username || 'Unknown'}
**Deterministic Post Analysis and Strategic Breakdown**

**Author:** Auto AI Scraper | **Date:** ${new Date().toISOString().split('T')[0]} | **Version:** 1.0

---

## Executive Summary
This report provides a deterministic analysis of the Instagram post located at ${input.permalink}. The content has been evaluated for marketing strategies, audience targeting, and key performance signals. The methodology relies on rule-based extraction to ensure consistency and precision without external AI dependencies.

> **Key Takeaway:** The primary marketing strategies are **${analysis.marketingStrategy.join(', ')}**, driving a specific call to action: **${analysis.callToAction}**.

---

## 1. Content Signals & Metrics
Analysis of the foundational elements and strategic markers within the post's content.

| Parameter / Metric | Baseline | Target / Result | Impact |
| :--- | :--- | :--- | :--- |
| **Brand / Creator** | @${input.username || 'Unknown'} | ${analysis.brand} | Account Identity |
| **Category** | Content Type | ${analysis.category.join(', ') || 'General'} | Market Positioning |
| **Emotional Signal** | Sentiment Baseline | ${analysis.emotionalSignal} | Audience Resonance |
| **Hashtags** | Volume | ${analysis.hashtags.all.length} tags | Discoverability |

---

## 2. Marketing Breakdown
Structured evaluation of the engagement and promotional pillars.

1. **Hook:** ${analysis.hook}
2. **Promotional Signals:** ${analysis.promotions.length > 0 ? analysis.promotions.join(', ') : 'None explicitly detected.'}
3. **Urgency/FOMO:** ${analysis.urgency.length > 0 ? analysis.urgency.join(', ') : 'None explicitly detected.'}
4. **Target Audience:** ${analysis.audience}

---

## Strategic Recommendations
* **Short-Term (0-30 Days):** Optimize the primary Call To Action (**${analysis.callToAction}**) and monitor the immediate engagement response to the **${analysis.emotionalSignal}** emotional signal.
* **Mid-Term (30-90 Days):** A/B test the identified hook against alternative strategies within the **${analysis.category[0] || 'general'}** category to refine audience alignment.

---
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