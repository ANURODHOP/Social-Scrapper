"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileRepository = void 0;
// src/repositories/profile.repository.ts
const firebase_1 = require("../firebase");
const crypto_1 = require("crypto");
const COL = 'profiles';
function toProfile(id, data) {
    return {
        id,
        platform: data['platform'],
        platformId: data['platformId'],
        username: data['username'],
        displayName: data['displayName'] ?? null,
        bio: data['bio'] ?? null,
        followerCount: data['followerCount'] ?? null,
        followingCount: data['followingCount'] ?? null,
        profilePicUrl: data['profilePicUrl'] ?? null,
        isActive: data['isActive'] ?? true,
        createdAt: data['createdAt']?.toDate?.() ?? new Date(data['createdAt']),
        updatedAt: data['updatedAt']?.toDate?.() ?? new Date(data['updatedAt']),
        deletedAt: data['deletedAt'] ? (data['deletedAt']?.toDate?.() ?? new Date(data['deletedAt'])) : null,
    };
}
class ProfileRepository {
    async findAll() {
        const snap = await firebase_1.db.collection(COL).orderBy('createdAt', 'desc').get();
        return snap.docs.map(d => toProfile(d.id, d.data()));
    }
    async findAllMonitored() {
        const snap = await firebase_1.db.collection(COL)
            .where('isActive', '==', true)
            .orderBy('username', 'asc')
            .get();
        return snap.docs.map(d => toProfile(d.id, d.data()));
    }
    async findById(id) {
        const doc = await firebase_1.db.collection(COL).doc(id).get();
        if (!doc.exists)
            return null;
        return toProfile(doc.id, doc.data());
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
        return toProfile(d.id, d.data());
    }
    async findByUsername(platform, username) {
        const snap = await firebase_1.db.collection(COL)
            .where('platform', '==', platform)
            .where('username', '==', username)
            .limit(1)
            .get();
        if (snap.empty)
            return null;
        const d = snap.docs[0];
        return toProfile(d.id, d.data());
    }
    async create(data) {
        const id = (0, crypto_1.randomUUID)();
        const now = new Date();
        const doc = { ...data, createdAt: now, updatedAt: now };
        await firebase_1.db.collection(COL).doc(id).set(doc);
        return toProfile(id, doc);
    }
    async update(id, data) {
        const now = new Date();
        await firebase_1.db.collection(COL).doc(id).update({ ...data, updatedAt: now });
        return (await this.findById(id));
    }
    async softDelete(id) {
        return this.update(id, { deletedAt: new Date(), isActive: false });
    }
    async count() {
        const snap = await firebase_1.db.collection(COL).where('deletedAt', '==', null).count().get();
        return snap.data().count;
    }
}
exports.ProfileRepository = ProfileRepository;
//# sourceMappingURL=profile.repository.js.map