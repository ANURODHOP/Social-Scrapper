"use strict";
// src/providers/storage/firebase.ts
// Firebase Storage provider implementing the StorageProvider interface.
// Uploads to Firebase Storage and returns a public signed URL.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseStorageProvider = void 0;
const firebase_1 = require("../../firebase");
const path_1 = __importDefault(require("path"));
class FirebaseStorageProvider {
    /**
     * Build a structured object key:
     *   <provider>/<profile>/<postId>/<subPath>
     */
    buildStructuredPath(providerName, profileIdentifier, postId, subPath) {
        return [providerName, profileIdentifier, postId, subPath].join('/');
    }
    async upload(fileBuffer, filePath) {
        const key = filePath.replace(/\\/g, '/');
        const file = firebase_1.bucket.file(key);
        const contentType = this.inferContentType(key);
        await file.save(fileBuffer, {
            metadata: { contentType },
            resumable: false,
        });
        // Make the file publicly accessible and return its public URL.
        // If your bucket is not public, replace this with a signed URL.
        await file.makePublic().catch(() => {
            // Bucket may have uniform access control — signed URL fallback below
        });
        // Try to get a permanent public URL first; fall back to a 7-day signed URL.
        try {
            return file.publicUrl();
        }
        catch {
            const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
            });
            return signedUrl;
        }
    }
    async download(filePath) {
        const key = filePath.replace(/\\/g, '/');
        const [fileBuffer] = await firebase_1.bucket.file(key).download();
        return fileBuffer;
    }
    async delete(filePath) {
        const key = filePath.replace(/\\/g, '/');
        await firebase_1.bucket.file(key).delete({ ignoreNotFound: true });
    }
    async exists(filePath) {
        const key = filePath.replace(/\\/g, '/');
        const [exists] = await firebase_1.bucket.file(key).exists();
        return exists;
    }
    // ─── Private Helpers ────────────────────────────────────────────────────────
    inferContentType(key) {
        const ext = path_1.default.extname(key).toLowerCase();
        const map = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.mp4': 'video/mp4',
            '.mov': 'video/quicktime',
            '.json': 'application/json',
            '.html': 'text/html',
            '.md': 'text/markdown',
        };
        return map[ext] ?? 'application/octet-stream';
    }
}
exports.FirebaseStorageProvider = FirebaseStorageProvider;
//# sourceMappingURL=firebase.js.map