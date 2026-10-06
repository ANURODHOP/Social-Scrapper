// src/firebase.ts
// Firebase Admin SDK singleton.
// Prevents multiple app initializations during ts-node-dev hot reloads.
// Reads credentials directly from environment variables — no JSON file needed.

import { initializeApp, cert, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

declare global {
  // eslint-disable-next-line no-var
  var __firebaseApp: App | undefined;
}

function createFirebaseApp(): App {
  const projectId   = process.env['FIREBASE_PROJECT_ID'];
  const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
  // dotenv stores \n as literal \\n — we must restore real newlines
  const privateKey  = (process.env['FIREBASE_PRIVATE_KEY'] ?? '').replace(/\\n/g, '\n');
  const storageBucket = process.env['FIREBASE_STORAGE_BUCKET'];

  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    throw new Error(
      '[Firebase] Missing required env vars: ' +
      'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET'
    );
  }

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  });
}

const app: App =
  process.env['NODE_ENV'] === 'production'
    ? createFirebaseApp()
    : (globalThis.__firebaseApp ??= createFirebaseApp());

export const db: Firestore = getFirestore(app);
export const storage: Storage = getStorage(app);
export const bucket = storage.bucket();

export { FieldValue };
export default app;
