// src/repositories/analysis.repository.ts
import { db } from '../firebase';
import { randomUUID } from 'crypto';
import type { DocumentData } from 'firebase-admin/firestore';

const COL = 'analysis';

export interface AnalysisDoc {
  id: string;
  postId: string;
  summary?: string | null;
  topics?: string[] | null;
  sentiment?: string | null;
  viralScore?: number | null;
  visualHook?: string | null;
  keyTakeaways?: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

function toAnalysis(id: string, data: DocumentData): AnalysisDoc {
  return {
    id,
    postId:       data['postId'],
    summary:      data['summary'] ?? null,
    topics:       data['topics'] ?? null,
    sentiment:    data['sentiment'] ?? null,
    viralScore:   data['viralScore'] ?? null,
    visualHook:   data['visualHook'] ?? null,
    keyTakeaways: data['keyTakeaways'] ?? null,
    createdAt:    data['createdAt']?.toDate?.() ?? new Date(data['createdAt']),
    updatedAt:    data['updatedAt']?.toDate?.() ?? new Date(data['updatedAt']),
  };
}

export class AnalysisRepository {
  async create(data: Omit<AnalysisDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnalysisDoc> {
    const id = randomUUID();
    const now = new Date();
    const doc = { ...data, createdAt: now, updatedAt: now };
    await db.collection(COL).doc(id).set(doc);
    return toAnalysis(id, doc);
  }

  async update(id: string, data: Partial<Omit<AnalysisDoc, 'id'>>): Promise<AnalysisDoc> {
    const now = new Date();
    await db.collection(COL).doc(id).update({ ...data, updatedAt: now });
    return (await this.findById(id))!;
  }

  async findByPostId(postId: string): Promise<AnalysisDoc | null> {
    const snap = await db.collection(COL)
      .where('postId', '==', postId)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return toAnalysis(snap.docs[0]!.id, snap.docs[0]!.data());
  }

  async findById(id: string): Promise<AnalysisDoc | null> {
    const doc = await db.collection(COL).doc(id).get();
    if (!doc.exists) return null;
    return toAnalysis(doc.id, doc.data()!);
  }

  async deleteByPostId(postId: string): Promise<void> {
    const snap = await db.collection(COL).where('postId', '==', postId).get();
    const batch = db.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
}
