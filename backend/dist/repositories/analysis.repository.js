"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisRepository = void 0;
// src/repositories/analysis.repository.ts
const firebase_1 = require("../firebase");
const crypto_1 = require("crypto");
const COL = 'analysis';
function toAnalysis(id, data) {
    return {
        id,
        postId: data['postId'],
        summary: data['summary'] ?? null,
        topics: data['topics'] ?? null,
        sentiment: data['sentiment'] ?? null,
        viralScore: data['viralScore'] ?? null,
        visualHook: data['visualHook'] ?? null,
        keyTakeaways: data['keyTakeaways'] ?? null,
        createdAt: data['createdAt']?.toDate?.() ?? new Date(data['createdAt']),
        updatedAt: data['updatedAt']?.toDate?.() ?? new Date(data['updatedAt']),
    };
}
class AnalysisRepository {
    async create(data) {
        const id = (0, crypto_1.randomUUID)();
        const now = new Date();
        const doc = { ...data, createdAt: now, updatedAt: now };
        await firebase_1.db.collection(COL).doc(id).set(doc);
        return toAnalysis(id, doc);
    }
    async update(id, data) {
        const now = new Date();
        await firebase_1.db.collection(COL).doc(id).update({ ...data, updatedAt: now });
        return (await this.findById(id));
    }
    async findByPostId(postId) {
        const snap = await firebase_1.db.collection(COL)
            .where('postId', '==', postId)
            .limit(1)
            .get();
        if (snap.empty)
            return null;
        return toAnalysis(snap.docs[0].id, snap.docs[0].data());
    }
    async findById(id) {
        const doc = await firebase_1.db.collection(COL).doc(id).get();
        if (!doc.exists)
            return null;
        return toAnalysis(doc.id, doc.data());
    }
    async deleteByPostId(postId) {
        const snap = await firebase_1.db.collection(COL).where('postId', '==', postId).get();
        const batch = firebase_1.db.batch();
        snap.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    }
}
exports.AnalysisRepository = AnalysisRepository;
//# sourceMappingURL=analysis.repository.js.map