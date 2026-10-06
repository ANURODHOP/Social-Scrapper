"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRepository = void 0;
// src/repositories/settings.repository.ts
const firebase_1 = require("../firebase");
const COL = 'platformSettings';
function getDocId(platform, key) {
    return `${platform}_${key}`;
}
class SettingsRepository {
    async getSetting(platform, key) {
        const docId = getDocId(platform, key);
        const doc = await firebase_1.db.collection(COL).doc(docId).get();
        if (!doc.exists)
            return null;
        const d = doc.data();
        return {
            id: doc.id,
            platform: d['platform'],
            key: d['key'],
            value: d['value'],
            description: d['description'] ?? null,
        };
    }
    async setSetting(platform, key, value, description) {
        const docId = getDocId(platform, key);
        const now = new Date();
        const data = {
            platform,
            key,
            value,
            description: description ?? null,
            updatedAt: now,
        };
        const ref = firebase_1.db.collection(COL).doc(docId);
        const doc = await ref.get();
        if (!doc.exists) {
            await ref.set({ ...data, createdAt: now });
        }
        else {
            await ref.update(data);
        }
        return (await this.getSetting(platform, key));
    }
    async getAllSettings() {
        const snap = await firebase_1.db.collection(COL).get();
        const settings = snap.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                platform: d['platform'] || '',
                key: d['key'] || '',
                value: d['value'] || '',
                description: d['description'] ?? null,
            };
        });
        return settings.sort((a, b) => {
            if (a.platform !== b.platform)
                return a.platform.localeCompare(b.platform);
            return a.key.localeCompare(b.key);
        });
    }
}
exports.SettingsRepository = SettingsRepository;
//# sourceMappingURL=settings.repository.js.map