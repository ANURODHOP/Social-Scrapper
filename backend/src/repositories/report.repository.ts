// src/repositories/report.repository.ts
import { db } from '../firebase';
import { randomUUID } from 'crypto';
import type { DocumentData } from 'firebase-admin/firestore';

const COL = 'reports';

export interface ReportDoc {
  id: string;
  postId?: string | null;
  profileId?: string | null;
  type: string;
  format: string;
  title: string;
  content: string;
  filePath?: string | null;
  generatedAt: Date;
}

function toReport(id: string, data: DocumentData): ReportDoc {
  return {
    id,
    postId:      data['postId'] ?? null,
    profileId:   data['profileId'] ?? null,
    type:        data['type'],
    format:      data['format'],
    title:       data['title'],
    content:     data['content'],
    filePath:    data['filePath'] ?? null,
    generatedAt: data['generatedAt']?.toDate?.() ?? new Date(data['generatedAt']),
  };
}

export class ReportRepository {
  async create(data: Omit<ReportDoc, 'id' | 'generatedAt'>): Promise<ReportDoc> {
    const id = randomUUID();
    const now = new Date();
    const doc = { ...data, generatedAt: now };
    await db.collection(COL).doc(id).set(doc);
    return toReport(id, doc);
  }

  async upsert(data: {
    postId?:   string;
    profileId?: string;
    type:      string;
    format:    string;
    title:     string;
    content:   string;
    filePath?: string;
  }): Promise<ReportDoc> {
    if (data.postId) {
      const snap = await db.collection(COL)
        .where('postId', '==', data.postId)
        .where('type', '==', data.type)
        .where('format', '==', data.format)
        .limit(1)
        .get();

      if (!snap.empty) {
        const existingDoc = snap.docs[0]!;
        const now = new Date();
        await existingDoc.ref.update({
          content: data.content,
          filePath: data.filePath ?? null,
          generatedAt: now,
        });
        return toReport(existingDoc.id, (await existingDoc.ref.get()).data()!);
      }
    }
    return this.create(data);
  }

  async findById(id: string): Promise<ReportDoc | null> {
    const doc = await db.collection(COL).doc(id).get();
    if (!doc.exists) return null;
    return toReport(doc.id, doc.data()!);
  }

  async findByPostId(postId: string): Promise<ReportDoc[]> {
    const snap = await db.collection(COL)
      .where('postId', '==', postId)
      .orderBy('generatedAt', 'desc')
      .get();
    return snap.docs.map(d => toReport(d.id, d.data()));
  }

  async findByProfileId(profileId: string): Promise<ReportDoc[]> {
    const snap = await db.collection(COL)
      .where('profileId', '==', profileId)
      .orderBy('generatedAt', 'desc')
      .get();
    return snap.docs.map(d => toReport(d.id, d.data()));
  }

  async findAll(limitCount = 50): Promise<ReportDoc[]> {
    const snap = await db.collection(COL)
      .orderBy('generatedAt', 'desc')
      .limit(limitCount)
      .get();
    return snap.docs.map(d => toReport(d.id, d.data()));
  }
}
