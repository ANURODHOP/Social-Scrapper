"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaRepository = void 0;
// src/repositories/media.repository.ts
const firebase_1 = require("../firebase");
const crypto_1 = require("crypto");
const MEDIA_COL = 'media';
const FILES_COL = 'mediaFiles';
function toDate(val) {
    if (!val)
        return new Date();
    if (val instanceof Date)
        return val;
    if (typeof val.toDate === 'function')
        return val.toDate();
    return new Date(val);
}
function toMedia(id, data, files = []) {
    return {
        id,
        postId: data['postId'],
        mediaUrl: data['mediaUrl'],
        mediaType: data['mediaType'],
        width: data['width'] ?? null,
        height: data['height'] ?? null,
        duration: data['duration'] ?? null,
        fileSize: data['fileSize'] ?? null,
        createdAt: toDate(data['createdAt']),
        updatedAt: toDate(data['updatedAt']),
        deletedAt: data['deletedAt'] ? toDate(data['deletedAt']) : null,
        mediaFiles: files,
    };
}
function toMediaFile(id, data) {
    return {
        id,
        mediaId: data['mediaId'],
        fileType: data['fileType'],
        filePath: data['filePath'],
        fileSize: data['fileSize'] ?? null,
        width: data['width'] ?? null,
        height: data['height'] ?? null,
        duration: data['duration'] ?? null,
        createdAt: toDate(data['createdAt']),
        updatedAt: toDate(data['updatedAt']),
    };
}
class MediaRepository {
    async createMedia(data) {
        const id = (0, crypto_1.randomUUID)();
        const now = new Date();
        const doc = { ...data, createdAt: now, updatedAt: now, deletedAt: null };
        await firebase_1.db.collection(MEDIA_COL).doc(id).set(doc);
        return toMedia(id, doc);
    }
    async createMediaFile(data) {
        const id = (0, crypto_1.randomUUID)();
        const now = new Date();
        const doc = { ...data, createdAt: now, updatedAt: now };
        await firebase_1.db.collection(FILES_COL).doc(id).set(doc);
        return toMediaFile(id, doc);
    }
    async getMediaForPost(postId) {
        // Step 1: get all media items for this post
        const mediaSnap = await firebase_1.db.collection(MEDIA_COL)
            .where('postId', '==', postId)
            .get();
        if (mediaSnap.empty)
            return [];
        // Step 2: for each media item, load its files (parallel)
        const results = await Promise.all(mediaSnap.docs.map(async (d) => {
            const filesSnap = await firebase_1.db.collection(FILES_COL)
                .where('mediaId', '==', d.id)
                .get();
            const files = filesSnap.docs.map(f => toMediaFile(f.id, f.data()));
            return toMedia(d.id, d.data(), files);
        }));
        return results;
    }
}
exports.MediaRepository = MediaRepository;
//# sourceMappingURL=media.repository.js.map