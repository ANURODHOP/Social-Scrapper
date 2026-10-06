"use strict";
// src/firebase.ts
// Firebase Admin SDK singleton.
// Prevents multiple app initializations during ts-node-dev hot reloads.
// Reads credentials directly from environment variables — no JSON file needed.
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldValue = exports.bucket = exports.storage = exports.db = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
Object.defineProperty(exports, "FieldValue", { enumerable: true, get: function () { return firestore_1.FieldValue; } });
const storage_1 = require("firebase-admin/storage");
function createFirebaseApp() {
    const projectId = process.env['FIREBASE_PROJECT_ID'];
    const clientEmail = process.env['FIREBASE_CLIENT_EMAIL'];
    // dotenv stores \n as literal \\n — we must restore real newlines
    const privateKey = (process.env['FIREBASE_PRIVATE_KEY'] ?? '').replace(/\\n/g, '\n');
    const storageBucket = process.env['FIREBASE_STORAGE_BUCKET'];
    if (!projectId || !clientEmail || !privateKey || !storageBucket) {
        throw new Error('[Firebase] Missing required env vars: ' +
            'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET');
    }
    if ((0, app_1.getApps)().length > 0) {
        return (0, app_1.getApp)();
    }
    return (0, app_1.initializeApp)({
        credential: (0, app_1.cert)({ projectId, clientEmail, privateKey }),
        storageBucket,
    });
}
const app = process.env['NODE_ENV'] === 'production'
    ? createFirebaseApp()
    : (globalThis.__firebaseApp ?? (globalThis.__firebaseApp = createFirebaseApp()));
exports.db = (0, firestore_1.getFirestore)(app);
exports.storage = (0, storage_1.getStorage)(app);
exports.bucket = exports.storage.bucket();
exports.default = app;
//# sourceMappingURL=firebase.js.map