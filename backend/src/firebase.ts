// src/firebase.ts
// Firebase Admin SDK singleton — LAZY initialization.
// Does NOT run any code at module-load time.
// Call getFirebaseApp(), db, storage, bucket to access Firebase —
// initialization happens on first access, so a module import never
// crashes the serverless function if env vars are missing.

import { initializeApp, cert, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

function createFirebaseApp(): App {
  // Return existing app if already initialized (handles hot reloads + serverless re-use)
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId     = process.env['FIREBASE_PROJECT_ID'];
  const clientEmail   = process.env['FIREBASE_CLIENT_EMAIL'];
  // Both dotenv and Vercel env vars can store \n as the two-char sequence \\n
  const rawKey        = process.env['FIREBASE_PRIVATE_KEY'] ?? '';
  const privateKey    = rawKey.replace(/\\n/g, '\n');
  const storageBucket = process.env['FIREBASE_STORAGE_BUCKET'];

  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    throw new Error(
      '[Firebase] Missing required env vars: ' +
      'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET'
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  });
}

// ── Lazy singletons ───────────────────────────────────────────────────────────
let _app: App | null = null;
let _db: Firestore | null = null;
let _storage: Storage | null = null;

export function getFirebaseApp(): App {
  if (!_app) _app = createFirebaseApp();
  return _app;
}

// db, storage, bucket are exported as lazy Proxy objects so all existing imports
// like `import { db } from '../firebase'` continue to work without changes.
// They initialize Firebase only when a property is first accessed (e.g. db.collection(...)).
export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    if (!_db) _db = getFirestore(getFirebaseApp());
    const val = (_db as any)[prop];
    return typeof val === 'function' ? val.bind(_db) : val;
  },
});

export const storage: Storage = new Proxy({} as Storage, {
  get(_target, prop) {
    if (!_storage) _storage = getStorage(getFirebaseApp());
    const val = (_storage as any)[prop];
    return typeof val === 'function' ? val.bind(_storage) : val;
  },
});

export const bucket = new Proxy({} as ReturnType<Storage['bucket']>, {
  get(_target, prop) {
    if (!_storage) _storage = getStorage(getFirebaseApp());
    const b = _storage.bucket();
    const val = (b as any)[prop];
    return typeof val === 'function' ? val.bind(b) : val;
  },
});

export { FieldValue };
export default new Proxy({} as App, {
  get(_target, prop) {
    const a = getFirebaseApp();
    const val = (a as any)[prop];
    return typeof val === 'function' ? val.bind(a) : val;
  },
});
