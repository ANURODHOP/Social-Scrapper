"use strict";
// src/providers/storage/factory.ts
// Reads the app config and returns the correct StorageProvider implementation.
// Supported providers: 'local', 's3', 'r2' (S3-compatible), 'b2' (S3-compatible)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStorageProvider = createStorageProvider;
const local_1 = require("./local");
const s3_1 = require("./s3");
const logger_1 = __importDefault(require("../../logger"));
/**
 * Create and return the storage provider configured in the app config.
 * Falls back to LocalStorageProvider if no cloud config is detected.
 */
function createStorageProvider(config) {
    const provider = config.provider ?? 'local';
    switch (provider) {
        // ── AWS S3 ──────────────────────────────────────────────────────────────
        case 's3': {
            const s3 = config.s3;
            if (!s3?.accessKeyId || !s3?.secretAccessKey || !s3?.bucket) {
                logger_1.default.warn('[Storage] S3 provider selected but credentials incomplete — falling back to local');
                return new local_1.LocalStorageProvider(config.local?.rootPath);
            }
            logger_1.default.info(`[Storage] Using AWS S3 — bucket: ${s3.bucket} region: ${s3.region}`);
            return new s3_1.S3StorageProvider({
                accessKeyId: s3.accessKeyId,
                secretAccessKey: s3.secretAccessKey,
                region: s3.region ?? 'auto',
                bucket: s3.bucket,
                endpoint: s3.endpoint,
                publicBaseUrl: process.env['STORAGE_PUBLIC_BASE_URL'],
            });
        }
        // ── Cloudflare R2 (S3-compatible) ────────────────────────────────────────
        case 'r2': {
            const r2 = config.r2;
            if (!r2?.accountId || !r2?.accessKeyId || !r2?.secretAccessKey || !r2?.bucket) {
                logger_1.default.warn('[Storage] R2 provider selected but credentials incomplete — falling back to local');
                return new local_1.LocalStorageProvider(config.local?.rootPath);
            }
            const endpoint = `https://${r2.accountId}.r2.cloudflarestorage.com`;
            logger_1.default.info(`[Storage] Using Cloudflare R2 — bucket: ${r2.bucket} endpoint: ${endpoint}`);
            return new s3_1.S3StorageProvider({
                accessKeyId: r2.accessKeyId,
                secretAccessKey: r2.secretAccessKey,
                region: 'auto',
                bucket: r2.bucket,
                endpoint,
                publicBaseUrl: process.env['STORAGE_PUBLIC_BASE_URL'],
            });
        }
        // ── Local filesystem (default / fallback) ─────────────────────────────────
        case 'local':
        default: {
            logger_1.default.info(`[Storage] Using local filesystem — root: ${config.local?.rootPath ?? './storage'}`);
            return new local_1.LocalStorageProvider(config.local?.rootPath);
        }
    }
}
//# sourceMappingURL=factory.js.map