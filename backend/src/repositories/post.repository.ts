// src/repositories/post.repository.ts
import { db } from '../firebase';
import { randomUUID } from 'crypto';
import type { DocumentData } from 'firebase-admin/firestore';

const COL = 'posts';

export interface PostDoc {
  id: string;
  platform: string;
  platformId: string;
  profileId: string;
  caption?: string | null;
  mediaType: string;
  permalink?: string | null;
  thumbnailUrl?: string | null;
  publishedAt: Date;
  collectedAt: Date;
  isProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

function toDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof (val as any).toDate === 'function') return (val as any).toDate();
  return new Date(val as string);
}

function toPost(id: string, data: DocumentData): PostDoc {
  return {
    id,
    platform:     data['platform'],
    platformId:   data['platformId'],
    profileId:    data['profileId'],
    caption:      data['caption'] ?? null,
    mediaType:    data['mediaType'],
    permalink:    data['permalink'] ?? null,
    thumbnailUrl: data['thumbnailUrl'] ?? null,
    publishedAt:  toDate(data['publishedAt']),
    collectedAt:  toDate(data['collectedAt']),
    isProcessed:  data['isProcessed'] ?? false,
    createdAt:    toDate(data['createdAt']),
    updatedAt:    toDate(data['updatedAt']),
    deletedAt:    data['deletedAt'] ? toDate(data['deletedAt']) : null,
  };
}

export class PostRepository {
  async findById(id: string): Promise<PostDoc | null> {
    const doc = await db.collection(COL).doc(id).get();
    if (!doc.exists) return null;
    return toPost(doc.id, doc.data()!);
  }

  async findByProfileId(profileId: string): Promise<PostDoc[]> {
    const snap = await db.collection(COL)
      .where('profileId', '==', profileId)
      .orderBy('publishedAt', 'desc')
      .get();
    return snap.docs.map(d => toPost(d.id, d.data()));
  }

  async findByPlatformAndId(platform: string, platformId: string): Promise<PostDoc | null> {
    const snap = await db.collection(COL)
      .where('platform', '==', platform)
      .where('platformId', '==', platformId)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const d = snap.docs[0]!;
    return toPost(d.id, d.data());
  }

  async create(data: Omit<PostDoc, 'id' | 'createdAt' | 'updatedAt' | 'collectedAt' | 'isProcessed'>): Promise<PostDoc> {
    const id  = randomUUID();
    const now = new Date();
    const doc = { ...data, isProcessed: false, collectedAt: now, createdAt: now, updatedAt: now };
    await db.collection(COL).doc(id).set(doc);
    return toPost(id, doc);
  }

  async update(id: string, data: Partial<Omit<PostDoc, 'id'>>): Promise<PostDoc> {
    const now = new Date();
    await db.collection(COL).doc(id).update({ ...data, updatedAt: now });
    return (await this.findById(id))!;
  }

  async getUnprocessedPosts(profileId?: string): Promise<PostDoc[]> {
    let query = db.collection(COL).where('isProcessed', '==', false) as FirebaseFirestore.Query;
    if (profileId) {
      query = query.where('profileId', '==', profileId);
    }
    query = query.orderBy('publishedAt', 'asc');
    const snap = await query.get();
    return snap.docs.map(d => toPost(d.id, d.data()));
  }

  async countForProfile(profileId: string): Promise<number> {
    const snap = await db.collection(COL).where('profileId', '==', profileId).get();
    return snap.docs.filter(d => !d.data()['deletedAt']).length;
  }

  async softDelete(id: string): Promise<PostDoc> {
    return this.update(id, { deletedAt: new Date() });
  }

  async findAll(limitCount = 50): Promise<PostDoc[]> {
    const snap = await db.collection(COL)
      .orderBy('publishedAt', 'desc')
      .limit(limitCount * 3) // fetch more to account for deleted ones
      .get();
    
    return snap.docs.map(d => toPost(d.id, d.data()))
      .filter(p => !p.deletedAt)
      .slice(0, limitCount);
  }
}
