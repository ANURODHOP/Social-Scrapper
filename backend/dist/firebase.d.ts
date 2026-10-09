import { App } from 'firebase-admin/app';
import { Firestore, FieldValue } from 'firebase-admin/firestore';
import { Storage } from 'firebase-admin/storage';
export declare function getFirebaseApp(): App;
export declare const db: Firestore;
export declare const storage: Storage;
export declare const bucket: import("@google-cloud/storage").Bucket;
export { FieldValue };
declare const _default: App;
export default _default;
//# sourceMappingURL=firebase.d.ts.map