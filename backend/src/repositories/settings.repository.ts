// src/repositories/settings.repository.ts
import { db } from '../firebase';

const COL = 'platformSettings';

export interface PlatformSettingDoc {
  id: string;
  platform: string;
  key: string;
  value: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

function getDocId(platform: string, key: string): string {
  return `${platform}_${key}`;
}

export class SettingsRepository {
  async getSetting(platform: string, key: string): Promise<PlatformSettingDoc | null> {
    const docId = getDocId(platform, key);
    const doc = await db.collection(COL).doc(docId).get();
    if (!doc.exists) return null;
    const d = doc.data()!;
    return {
      id: doc.id,
      platform: d['platform'],
      key: d['key'],
      value: d['value'],
      description: d['description'] ?? null,
    };
  }

  async setSetting(platform: string, key: string, value: string, description?: string): Promise<PlatformSettingDoc> {
    const docId = getDocId(platform, key);
    const now = new Date();
    const data = {
      platform,
      key,
      value,
      description: description ?? null,
      updatedAt: now,
    };

    const ref = db.collection(COL).doc(docId);
    const doc = await ref.get();
    if (!doc.exists) {
      await ref.set({ ...data, createdAt: now });
    } else {
      await ref.update(data);
    }

    return (await this.getSetting(platform, key))!;
  }

  async getAllSettings(): Promise<PlatformSettingDoc[]> {
    const snap = await db.collection(COL).get();
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
      if (a.platform !== b.platform) return a.platform.localeCompare(b.platform);
      return a.key.localeCompare(b.key);
    });
  }
}
