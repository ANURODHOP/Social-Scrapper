"use strict";
// src/services/report/ReportAnalyzer.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportAnalyzer = void 0;
const rules_1 = require("./rules");
class ReportAnalyzer {
    analyze(caption, username) {
        const text = (caption || '').toLowerCase();
        return {
            marketingStrategy: this.detectStrategies(text),
            hook: this.detectHook(caption),
            primaryMessage: this.detectPrimaryMessage(caption),
            callToAction: this.detectCTA(text),
            promotions: this.extractMatches(text, rules_1.RULES.promotional),
            urgency: this.extractMatches(text, rules_1.RULES.urgency),
            engagementStrategy: this.extractMatches(text, rules_1.RULES.engagement),
            emotionalSignal: this.detectEmotion(text),
            brand: this.detectBrand(username),
            category: this.detectCategory(text),
            hashtags: this.analyzeHashtags(caption),
            audience: this.detectAudience(text)
        };
    }
    detectStrategies(text) {
        const strategies = new Set();
        if (this.hasAny(text, rules_1.RULES.promotional))
            strategies.add('Promotional');
        if (this.hasAny(text, rules_1.RULES.urgency))
            strategies.add('Urgency/FOMO');
        if (this.hasAny(text, rules_1.RULES.engagement))
            strategies.add('Engagement');
        if (this.hasAny(text, rules_1.RULES.educational))
            strategies.add('Educational');
        if (this.hasAny(text, rules_1.RULES.demonstration))
            strategies.add('Product Demonstration');
        if (this.hasAny(text, rules_1.RULES.socialProof))
            strategies.add('Social Proof');
        if (this.hasAny(text, rules_1.RULES.giveaway))
            strategies.add('Giveaway/Contest');
        if (this.hasAny(text, rules_1.RULES.sponsored))
            strategies.add('Sponsored/Creator Content');
        if (strategies.size === 0) {
            strategies.add('Not identified from available content');
        }
        return Array.from(strategies);
    }
    detectHook(caption) {
        if (!caption)
            return 'Not identified from available content';
        const sentences = caption.split(/(?<=[.!?\\n])\\s+/);
        if (sentences.length > 0 && sentences[0].trim().length > 0) {
            return sentences[0].trim();
        }
        return 'Opening caption does not contain a clear hook.';
    }
    detectPrimaryMessage(caption) {
        if (!caption)
            return 'Not identified from available content';
        return 'Detailed primary message extraction relies on textual analysis not strictly handled by keywords. Refer to full caption.';
    }
    detectCTA(text) {
        const matches = this.extractMatches(text, rules_1.RULES.cta);
        return matches.length > 0 ? matches.join(', ') : 'Not identified';
    }
    detectEmotion(text) {
        for (const [emotion, keywords] of Object.entries(rules_1.RULES.emotions)) {
            if (this.hasAny(text, keywords)) {
                return emotion.charAt(0).toUpperCase() + emotion.slice(1);
            }
        }
        return 'Neutral';
    }
    detectBrand(username) {
        if (username)
            return username;
        return 'Not identified';
    }
    detectCategory(text) {
        const matchedCategories = [];
        for (const [category, keywords] of Object.entries(rules_1.RULES.categories)) {
            if (this.hasAny(text, keywords)) {
                matchedCategories.push(category);
            }
        }
        return matchedCategories.length > 0 ? matchedCategories : ['Not identified'];
    }
    analyzeHashtags(caption) {
        if (!caption)
            return { all: [], branded: [], campaign: [], category: [] };
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
    detectAudience(text) {
        const match = text.match(/calling all ([a-z ]+)|perfect for ([a-z ]+)|([a-z]+), this one's for you/i);
        if (match) {
            return (match[1] || match[2] || match[3]).trim();
        }
        return 'Not explicitly identified from caption.';
    }
    hasAny(text, keywords) {
        return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    }
    extractMatches(text, keywords) {
        return keywords.filter(keyword => text.includes(keyword.toLowerCase()));
    }
}
exports.ReportAnalyzer = ReportAnalyzer;
//# sourceMappingURL=ReportAnalyzer.js.map