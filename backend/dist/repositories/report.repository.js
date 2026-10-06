"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRepository = void 0;
// src/repositories/report.repository.ts
const firebase_1 = require("../firebase");
const crypto_1 = require("crypto");
const COL = 'reports';
function toReport(id, data) {
    return {
        id,
        postId: data['postId'] ?? null,
        profileId: data['profileId'] ?? null,
        type: data['type'],
        format: data['format'],
        title: data['title'],
        content: data['content'],
        filePath: data['filePath'] ?? null,
        generatedAt: data['generatedAt']?.toDate?.() ?? new Date(data['generatedAt']),
    };
}
class ReportRepository {
    async create(data) {
        const id = (0, crypto_1.randomUUID)();
        const now = new Date();
        const doc = { ...data, generatedAt: now };
        await firebase_1.db.collection(COL).doc(id).set(doc);
        return toReport(id, doc);
    }
    async upsert(data) {
        if (data.postId) {
            const snap = await firebase_1.db.collection(COL)
                .where('postId', '==', data.postId)
                .where('type', '==', data.type)
                .where('format', '==', data.format)
                .limit(1)
                .get();
            if (!snap.empty) {
                const existingDoc = snap.docs[0];
                const now = new Date();
                await existingDoc.ref.update({
                    content: data.content,
                    filePath: data.filePath ?? null,
                    generatedAt: now,
                });
                return toReport(existingDoc.id, (await existingDoc.ref.get()).data());
            }
        }
        return this.create(data);
    }
    async findById(id) {
        const doc = await firebase_1.db.collection(COL).doc(id).get();
        if (!doc.exists)
            return null;
        return toReport(doc.id, doc.data());
    }
    async findByPostId(postId) {
        const snap = await firebase_1.db.collection(COL)
            .where('postId', '==', postId)
            .orderBy('generatedAt', 'desc')
            .get();
        return snap.docs.map(d => toReport(d.id, d.data()));
    }
    async findByProfileId(profileId) {
        const snap = await firebase_1.db.collection(COL)
            .where('profileId', '==', profileId)
            .orderBy('generatedAt', 'desc')
            .get();
        return snap.docs.map(d => toReport(d.id, d.data()));
    }
    async findAll(limitCount = 50) {
        const snap = await firebase_1.db.collection(COL)
            .orderBy('generatedAt', 'desc')
            .limit(limitCount)
            .get();
        return snap.docs.map(d => toReport(d.id, d.data()));
    }
}
exports.ReportRepository = ReportRepository;
//# sourceMappingURL=report.repository.js.map