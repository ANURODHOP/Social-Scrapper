"use strict";
// src/services/report/rules.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.RULES = void 0;
exports.RULES = {
    promotional: [
        "sale", "offer", "discount", "off", "deal", "limited offer",
        "promotion", "clearance", "coupon", "code", "buy", "shop"
    ],
    urgency: [
        "today only", "limited time", "ending soon", "last chance",
        "hurry", "don't miss", "only today", "limited stock", "while supplies last"
    ],
    cta: [
        "shop now", "buy now", "learn more", "sign up", "subscribe",
        "follow", "comment", "share", "save", "click", "visit", "download",
        "dm", "link in bio"
    ],
    engagement: [
        "comment below", "tell us", "what do you think", "tag a friend",
        "share this", "save this", "vote", "choose", "a or b", "a/b"
    ],
    educational: [
        "how to", "tips", "guide", "tutorial", "learn", "explained",
        "step by step", "ways", "mistakes", "beginner", "checklist"
    ],
    demonstration: [
        "how it works", "demonstration", "demo", "before/after",
        "before and after", "using", "apply", "test", "results"
    ],
    socialProof: [
        "customer review", "testimonial", "customer says", "people love",
        "rated", "reviews", "feedback", "trusted by"
    ],
    giveaway: [
        "giveaway", "win", "contest", "winner", "enter", "prize", "tag friends"
    ],
    sponsored: [
        "sponsored", "partnership", "#ad", "#sponsored", "paid partnership"
    ],
    emotions: {
        urgency: ["hurry", "today only", "don't miss", "last chance"],
        desire: ["dream", "perfect", "gorgeous", "beautiful", "amazing", "must have"],
        happiness: ["happy", "joy", "smile", "love", "amazing"],
        curiosity: ["secret", "discover", "find out", "why", "how"],
        trust: ["guarantee", "proven", "trusted", "certified", "safe"],
        excitement: ["wow", "finally", "introducing", "new", "excited"]
    },
    categories: {
        "Beauty / Skincare": ["serum", "moisturizer", "skincare", "skin", "cream", "glow", "acne", "makeup", "beauty"],
        "Footwear / Sports": ["shoes", "running", "sneakers", "run", "sport", "athletic", "cleats"],
        "Food & Beverage": ["restaurant", "menu", "dish", "food", "drink", "delicious", "tasty", "recipe", "cook"],
        "Education": ["course", "learn", "class", "training", "webinar", "students", "masterclass"],
        "Fashion / Apparel": ["clothing", "apparel", "fashion", "outfit", "dress", "shirt", "pants", "wear"]
    }
};
//# sourceMappingURL=rules.js.map