// src/services/report/ReportGenerator.ts

import { ReportAnalyzer } from './ReportAnalyzer';
import { ReportFormatter, ReportInput } from './ReportFormatter';
import logger from '../../logger';

export class ReportGenerator {
  private analyzer: ReportAnalyzer;
  private formatter: ReportFormatter;

  constructor() {
    this.analyzer = new ReportAnalyzer();
    this.formatter = new ReportFormatter();
  }

  public generateReport(input: Omit<ReportInput, 'analysis'>): { html: string, markdown: string, title: string, analysisResult: any } {
    logger.info(`[REPORT] Starting deterministic report generation for ${input.permalink}`);
    
    // Analyze
    const analysis = this.analyzer.analyze(input.caption, input.username);
    
    logger.info(`[REPORT] Detected strategies: ${analysis.marketingStrategy.join(', ')}`);
    logger.info(`[REPORT] Detected CTA: ${analysis.callToAction}`);

    // Format
    const fullInput: ReportInput = {
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
