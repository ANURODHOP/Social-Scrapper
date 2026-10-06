// src/providers/storage/firebase.ts
// Firebase Storage provider implementing the StorageProvider interface.
// Uploads to Firebase Storage and returns a public signed URL.

import { StorageProvider } from './base';
import { bucket } from '../../firebase';
import path from 'path';

export class FirebaseStorageProvider implements StorageProvider {

  /**
   * Build a structured object key:
   *   <provider>/<profile>/<postId>/<subPath>
   */
  public buildStructuredPath(
    providerName: string,
    profileIdentifier: string,
    postId: string,
    subPath: string,
  ): string {
    return [providerName, profileIdentifier, postId, subPath].join('/');
  }

  async upload(fileBuffer: Buffer, filePath: string): Promise<string> {
    const key = filePath.replace(/\\/g, '/');
    const file = bucket.file(key);
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
    } catch {
      const [signedUrl] = await file.getSignedUrl({
        action:  'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });
      return signedUrl;
    }
  }

  async download(filePath: string): Promise<Buffer> {
    const key = filePath.replace(/\\/g, '/');
    const [fileBuffer] = await bucket.file(key).download();
    return fileBuffer;
  }

  async delete(filePath: string): Promise<void> {
    const key = filePath.replace(/\\/g, '/');
    await bucket.file(key).delete({ ignoreNotFound: true });
  }

  async exists(filePath: string): Promise<boolean> {
    const key = filePath.replace(/\\/g, '/');
    const [exists] = await bucket.file(key).exists();
    return exists;
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private inferContentType(key: string): string {
    const ext = path.extname(key).toLowerCase();
    const map: Record<string, string> = {
      '.jpg':  'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png':  'image/png',
      '.webp': 'image/webp',
      '.mp4':  'video/mp4',
      '.mov':  'video/quicktime',
      '.json': 'application/json',
      '.html': 'text/html',
      '.md':   'text/markdown',
    };
    return map[ext] ?? 'application/octet-stream';
  }
}
