"use strict";
// src/firebase.ts
// Firebase Admin SDK singleton — LAZY initialization.
// Does NOT run any code at module-load time.
// Call getFirebaseApp(), db, storage, bucket to access Firebase —
// initialization happens on first access, so a module import never
// crashes the serverless function if env vars are missing.
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldValue = exports.bucket = exports.storage = exports.db = void 0;
exports.getFirebaseApp = getFirebaseApp;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
Object.defineProperty(exports, "FieldValue", { enumerable: true, get: function () { return firestore_1.FieldValue; } });
const storage_1 = require("firebase-admin/storage");
function createFirebaseApp() {
    // Return existing app if already initialized (handles hot reloads + serverless re-use)
    if ((0, app_1.getApps)().length > 0) {
        return (0, app_1.getApp)();
    }
    const projectId = process.env['FIREBASE_PROJECT_ID'];
    const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
    // Both dotenv and Vercel env vars can store \n as the two-char sequence \\n
    const rawKey = process.env['FIREBASE_PRIVATE_KEY'] ?? '';
    const privateKey = rawKey.replace(/\\n/g, '\n');
    const storageBucket = process.env['FIREBASE_STORAGE_BUCKET'];
    if (!projectId || !clientEmail || !privateKey || !storageBucket) {
        throw new Error('[Firebase] Missing required env vars: ' +
            'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET');
    }
    return (0, app_1.initializeApp)({
        credential: (0, app_1.cert)({ projectId, clientEmail, privateKey }),
        storageBucket,
    });
}
// ── Lazy singletons ───────────────────────────────────────────────────────────
let _app = null;
let _db = null;
let _storage = null;
function getFirebaseApp() {
    if (!_app)
        _app = createFirebaseApp();
    return _app;
}
// db, storage, bucket are exported as lazy Proxy objects so all existing imports
// like `import { db } from '../firebase'` continue to work without changes.
// They initialize Firebase only when a property is first accessed (e.g. db.collection(...)).
exports.db = new Proxy({}, {
    get(_target, prop) {
        if (!_db) {
            _db = (0, firestore_1.getFirestore)(getFirebaseApp());
            _db.settings({ ignoreUndefinedProperties: true });
        }
        const val = _db[prop];
        return typeof val === 'function' ? val.bind(_db) : val;
    },
});
exports.storage = new Proxy({}, {
    get(_target, prop) {
        if (!_storage)
            _storage = (0, storage_1.getStorage)(getFirebaseApp());
        const val = _storage[prop];
        return typeof val === 'function' ? val.bind(_storage) : val;
    },
});
exports.bucket = new Proxy({}, {
    get(_target, prop) {
        if (!_storage)
            _storage = (0, storage_1.getStorage)(getFirebaseApp());
        const b = _storage.bucket();
        const val = b[prop];
        return typeof val === 'function' ? val.bind(b) : val;
    },
});
exports.default = new Proxy({}, {
    get(_target, prop) {
        const a = getFirebaseApp();
        const val = a[prop];
        return typeof val === 'function' ? val.bind(a) : val;
    },
});
//# sourceMappingURL=firebase.js.map