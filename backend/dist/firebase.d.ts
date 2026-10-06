import { App } from 'firebase-admin/app';
import { Firestore, FieldValue } from 'firebase-admin/firestore';
import { Storage } from 'firebase-admin/storage';
declare global {
    var __firebaseApp: App | undefined;
}
declare const app: App;
export declare const db: Firestore;
export declare const storage: Storage;
export declare const bucket: import("@google-cloud/storage").Bucket;
export { FieldValue };
export default app;
//# sourceMappingURL=firebase.d.ts.map