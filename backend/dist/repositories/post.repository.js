"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRepository = void 0;
// src/repositories/post.repository.ts
const firebase_1 = require("../firebase");
const crypto_1 = require("crypto");
const COL = 'posts';
function toDate(val) {
    if (!val)
        return new Date();
    if (val instanceof Date)
        return val;
    if (typeof val.toDate === 'function')
        return val.toDate();
    return new Date(val);
}
function toPost(id, data) {
    return {
        id,
        platform: data['platform'],
        platformId: data['platformId'],
        profileId: data['profileId'],
        caption: data['caption'] ?? null,
        mediaType: data['mediaType'],
        permalink: data['permalink'] ?? null,
        thumbnailUrl: data['thumbnailUrl'] ?? null,
        publishedAt: toDate(data['publishedAt']),
        collectedAt: toDate(data['collectedAt']),
        isProcessed: data['isProcessed'] ?? false,
        createdAt: toDate(data['createdAt']),
        updatedAt: toDate(data['updatedAt']),
        deletedAt: data['deletedAt'] ? toDate(data['deletedAt']) : null,
    };
}
class PostRepository {
    async findById(id) {
        const doc = await firebase_1.db.collection(COL).doc(id).get();
        if (!doc.exists)
            return null;
        return toPost(doc.id, doc.data());
    }
    async findByProfileId(profileId) {
        const snap = await firebase_1.db.collection(COL)
            .where('profileId', '==', profileId)
            .orderBy('publishedAt', 'desc')
            .get();
        return snap.docs.map(d => toPost(d.id, d.data()));
    }
    async findByPlatformAndId(platform, platformId) {
        const snap = await firebase_1.db.collection(COL)
            .where('platform', '==', platform)
            .where('platformId', '==', platformId)
            .limit(1)
            .get();
        if (snap.empty)
            return null;
        const d = snap.docs[0];
        return toPost(d.id, d.data());
    }
    async create(data) {
        const id = (0, crypto_1.randomUUID)();
        const now = new Date();
        const doc = { ...data, isProcessed: false, collectedAt: now, createdAt: now, updatedAt: now };
        await firebase_1.db.collection(COL).doc(id).set(doc);
        return toPost(id, doc);
    }
    async update(id, data) {
        const now = new Date();
        await firebase_1.db.collection(COL).doc(id).update({ ...data, updatedAt: now });
        return (await this.findById(id));
    }
    async getUnprocessedPosts(profileId) {
        let query = firebase_1.db.collection(COL).where('isProcessed', '==', false);
        if (profileId) {
            query = query.where('profileId', '==', profileId);
        }
        query = query.orderBy('publishedAt', 'asc');
        const snap = await query.get();
        return snap.docs.map(d => toPost(d.id, d.data()));
    }
    async countForProfile(profileId) {
        const snap = await firebase_1.db.collection(COL).where('profileId', '==', profileId).count().get();
        return snap.data().count;
    }
    async findAll(limitCount = 50) {
        const snap = await firebase_1.db.collection(COL)
            .where('deletedAt', '==', null)
            .orderBy('publishedAt', 'desc')
            .limit(limitCount)
            .get();
        return snap.docs.map(d => toPost(d.id, d.data()));
    }
}
exports.PostRepository = PostRepository;
//# sourceMappingURL=post.repository.js.map