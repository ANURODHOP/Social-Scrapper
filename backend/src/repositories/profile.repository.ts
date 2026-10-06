// src/repositories/profile.repository.ts
import { db } from '../firebase';
import { randomUUID } from 'crypto';
import type { DocumentData } from 'firebase-admin/firestore';

const COL = 'profiles';

/** Shape that callers and the rest of the app expect */
export interface ProfileDoc {
  id: string;
  platform: string;
  platformId: string;
  username: string;
  displayName?: string | null;
  bio?: string | null;
  followerCount?: number | null;
  followingCount?: number | null;
  profilePicUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

function toProfile(id: string, data: DocumentData): ProfileDoc {
  return {
    id,
    platform:       data['platform'],
    platformId:     data['platformId'],
    username:       data['username'],
    displayName:    data['displayName'] ?? null,
    bio:            data['bio'] ?? null,
    followerCount:  data['followerCount'] ?? null,
    followingCount: data['followingCount'] ?? null,
    profilePicUrl:  data['profilePicUrl'] ?? null,
    isActive:       data['isActive'] ?? true,
    createdAt:      data['createdAt']?.toDate?.() ?? new Date(data['createdAt']),
    updatedAt:      data['updatedAt']?.toDate?.() ?? new Date(data['updatedAt']),
    deletedAt:      data['deletedAt'] ? (data['deletedAt']?.toDate?.() ?? new Date(data['deletedAt'])) : null,
  };
}

export class ProfileRepository {
  async findAll(): Promise<ProfileDoc[]> {
    const snap = await db.collection(COL).orderBy('createdAt', 'desc').get();
    return snap.docs.map(d => toProfile(d.id, d.data()));
  }

  async findAllMonitored(): Promise<ProfileDoc[]> {
    const snap = await db.collection(COL)
      .where('isActive', '==', true)
      .orderBy('username', 'asc')
      .get();
    return snap.docs.map(d => toProfile(d.id, d.data()));
  }

  async findById(id: string): Promise<ProfileDoc | null> {
    const doc = await db.collection(COL).doc(id).get();
    if (!doc.exists) return null;
    return toProfile(doc.id, doc.data()!);
  }

  async findByPlatformAndId(platform: string, platformId: string): Promise<ProfileDoc | null> {
    const snap = await db.collection(COL)
      .where('platform', '==', platform)
      .where('platformId', '==', platformId)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const d = snap.docs[0]!;
    return toProfile(d.id, d.data());
  }

  async findByUsername(platform: string, username: string): Promise<ProfileDoc | null> {
    const snap = await db.collection(COL)
      .where('platform', '==', platform)
      .where('username', '==', username)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const d = snap.docs[0]!;
    return toProfile(d.id, d.data());
  }

  async create(data: Omit<ProfileDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProfileDoc> {
    const id  = randomUUID();
    const now = new Date();
    const doc = { ...data, createdAt: now, updatedAt: now };
    await db.collection(COL).doc(id).set(doc);
    return toProfile(id, doc);
  }

  async update(id: string, data: Partial<Omit<ProfileDoc, 'id'>>): Promise<ProfileDoc> {
    const now = new Date();
    await db.collection(COL).doc(id).update({ ...data, updatedAt: now });
    return (await this.findById(id))!;
  }

  async softDelete(id: string): Promise<ProfileDoc> {
    return this.update(id, { deletedAt: new Date(), isActive: false });
  }

  async count(): Promise<number> {
    const snap = await db.collection(COL).where('deletedAt', '==', null).count().get();
    return snap.data().count;
  }
}
