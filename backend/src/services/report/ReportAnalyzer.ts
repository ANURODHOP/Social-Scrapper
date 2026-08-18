// src/services/report/ReportAnalyzer.ts

import { RULES } from './rules';

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

export class ReportAnalyzer {
  public analyze(caption: string | null | undefined, username: string | null | undefined): DeterministicAnalysisResult {
    const text = (caption || '').toLowerCase();
    
    return {
      marketingStrategy: this.detectStrategies(text),
      hook: this.detectHook(caption),
      primaryMessage: this.detectPrimaryMessage(caption),
      callToAction: this.detectCTA(text),
      promotions: this.extractMatches(text, RULES.promotional),
      urgency: this.extractMatches(text, RULES.urgency),
      engagementStrategy: this.extractMatches(text, RULES.engagement),
      emotionalSignal: this.detectEmotion(text),
      brand: this.detectBrand(username),
      category: this.detectCategory(text),
      hashtags: this.analyzeHashtags(caption),
      audience: this.detectAudience(text)
    };
  }

  private detectStrategies(text: string): string[] {
    const strategies = new Set<string>();
    
    if (this.hasAny(text, RULES.promotional)) strategies.add('Promotional');
    if (this.hasAny(text, RULES.urgency)) strategies.add('Urgency/FOMO');
    if (this.hasAny(text, RULES.engagement)) strategies.add('Engagement');
    if (this.hasAny(text, RULES.educational)) strategies.add('Educational');
    if (this.hasAny(text, RULES.demonstration)) strategies.add('Product Demonstration');
    if (this.hasAny(text, RULES.socialProof)) strategies.add('Social Proof');
    if (this.hasAny(text, RULES.giveaway)) strategies.add('Giveaway/Contest');
    if (this.hasAny(text, RULES.sponsored)) strategies.add('Sponsored/Creator Content');
    
    if (strategies.size === 0) {
      strategies.add('Not identified from available content');
    }
    
    return Array.from(strategies);
  }

  private detectHook(caption: string | null | undefined): string {
    if (!caption) return 'Not identified from available content';
    
    const sentences = caption.split(/(?<=[.!?\\n])\\s+/);
    if (sentences.length > 0 && sentences[0]!.trim().length > 0) {
      return sentences[0]!.trim();
    }
    return 'Opening caption does not contain a clear hook.';
  }

  private detectPrimaryMessage(caption: string | null | undefined): string {
    if (!caption) return 'Not identified from available content';
    return 'Detailed primary message extraction relies on textual analysis not strictly handled by keywords. Refer to full caption.';
  }

  private detectCTA(text: string): string | null {
    const matches = this.extractMatches(text, RULES.cta);
    return matches.length > 0 ? matches.join(', ') : 'Not identified';
  }

  private detectEmotion(text: string): string {
    for (const [emotion, keywords] of Object.entries(RULES.emotions)) {
      if (this.hasAny(text, keywords)) {
        return emotion.charAt(0).toUpperCase() + emotion.slice(1);
      }
    }
    return 'Neutral';
  }

  private detectBrand(username: string | null | undefined): string {
    if (username) return username;
    return 'Not identified';
  }

  private detectCategory(text: string): string[] {
    const matchedCategories = [];
    for (const [category, keywords] of Object.entries(RULES.categories)) {
      if (this.hasAny(text, keywords)) {
        matchedCategories.push(category);
      }
    }
    return matchedCategories.length > 0 ? matchedCategories : ['Not identified'];
  }

  private analyzeHashtags(caption: string | null | undefined) {
    if (!caption) return { all: [], branded: [], campaign: [], category: [] };
    const regex = /#\\w+/g;
    const all = caption.match(regex) || [];
    
    // Simplistic heuristic for hash tag separation, could be expanded
    return {
      all,
      branded: [], // Hard to deterministically detect without a known brand
      campaign: [],
      category: all
    };
  }

  private detectAudience(text: string): string {
    const match = text.match(/calling all ([a-z ]+)|perfect for ([a-z ]+)|([a-z]+), this one's for you/i);
    if (match) {
      return (match[1] || match[2] || match[3]!).trim();
    }
    return 'Not explicitly identified from caption.';
  }

  private hasAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }

  private extractMatches(text: string, keywords: string[]): string[] {
    return keywords.filter(keyword => text.includes(keyword.toLowerCase()));
  }
}
