// src/repositories/media.repository.ts
import { db } from '../firebase';
import { randomUUID } from 'crypto';
import type { DocumentData } from 'firebase-admin/firestore';

const MEDIA_COL = 'media';
const FILES_COL = 'mediaFiles';

export interface MediaDoc {
  id: string;
  postId: string;
  mediaUrl: string;
  mediaType: string;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  fileSize?: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  mediaFiles: MediaFileDoc[];
}

export interface MediaFileDoc {
  id: string;
  mediaId: string;
  fileType: string;
  filePath: string;
  fileSize?: number | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

function toDate(val: unknown): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof (val as any).toDate === 'function') return (val as any).toDate();
  return new Date(val as string);
}

function toMedia(id: string, data: DocumentData, files: MediaFileDoc[] = []): MediaDoc {
  return {
    id,
    postId:    data['postId'],
    mediaUrl:  data['mediaUrl'],
    mediaType: data['mediaType'],
    width:     data['width'] ?? null,
    height:    data['height'] ?? null,
    duration:  data['duration'] ?? null,
    fileSize:  data['fileSize'] ?? null,
    createdAt: toDate(data['createdAt']),
    updatedAt: toDate(data['updatedAt']),
    deletedAt: data['deletedAt'] ? toDate(data['deletedAt']) : null,
    mediaFiles: files,
  };
}

function toMediaFile(id: string, data: DocumentData): MediaFileDoc {
  return {
    id,
    mediaId:  data['mediaId'],
    fileType: data['fileType'],
    filePath: data['filePath'],
    fileSize: data['fileSize'] ?? null,
    width:    data['width'] ?? null,
    height:   data['height'] ?? null,
    duration: data['duration'] ?? null,
    createdAt: toDate(data['createdAt']),
    updatedAt: toDate(data['updatedAt']),
  };
}

export class MediaRepository {
  async createMedia(data: Omit<MediaDoc, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'mediaFiles'>): Promise<MediaDoc> {
    const id  = randomUUID();
    const now = new Date();
    const doc = { ...data, createdAt: now, updatedAt: now, deletedAt: null };
    await db.collection(MEDIA_COL).doc(id).set(doc);
    return toMedia(id, doc);
  }

  async createMediaFile(data: Omit<MediaFileDoc, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaFileDoc> {
    const id  = randomUUID();
    const now = new Date();
    const doc = { ...data, createdAt: now, updatedAt: now };
    await db.collection(FILES_COL).doc(id).set(doc);
    return toMediaFile(id, doc);
  }

  async getMediaForPost(postId: string): Promise<MediaDoc[]> {
    // Step 1: get all media items for this post
    const mediaSnap = await db.collection(MEDIA_COL)
      .where('postId', '==', postId)
      .get();

    if (mediaSnap.empty) return [];

    // Step 2: for each media item, load its files (parallel)
    const results = await Promise.all(
      mediaSnap.docs.map(async (d) => {
        const filesSnap = await db.collection(FILES_COL)
          .where('mediaId', '==', d.id)
          .get();
        const files = filesSnap.docs.map(f => toMediaFile(f.id, f.data()));
        return toMedia(d.id, d.data(), files);
      })
    );

    return results;
  }
}
