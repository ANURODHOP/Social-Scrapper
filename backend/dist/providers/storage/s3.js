"use strict";
// src/providers/storage/s3.ts
// S3-compatible storage provider.
// Works with AWS S3, Cloudflare R2 (via custom endpoint), and Backblaze B2.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageProvider = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const path_1 = __importDefault(require("path"));
class S3StorageProvider {
    constructor(config) {
        this.bucket = config.bucket;
        this.publicBaseUrl = config.publicBaseUrl;
        this.client = new client_s3_1.S3Client({
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
            // R2 / B2 / MinIO require a custom endpoint
            ...(config.endpoint ? { endpoint: config.endpoint, forcePathStyle: true } : {}),
        });
    }
    /**
     * Build a structured key for cloud storage:
     *   <provider>/<profile>/<postId>/<subPath>
     * Uses forward slashes regardless of OS.
     */
    buildStructuredPath(providerName, profileIdentifier, postId, subPath) {
        return [providerName, profileIdentifier, postId, subPath]
            .join('/')
            .replace(/\\/g, '/');
    }
    async upload(fileBuffer, filePath) {
        // Normalise Windows backslashes to forward slashes for S3 keys
        const key = filePath.replace(/\\/g, '/');
        const contentType = this.inferContentType(key);
        // Use multipart upload for large files (>= 5 MB), regular put for small ones
        if (fileBuffer.length >= 5 * 1024 * 1024) {
            const upload = new lib_storage_1.Upload({
                client: this.client,
                params: {
                    Bucket: this.bucket,
                    Key: key,
                    Body: fileBuffer,
                    ContentType: contentType,
                },
            });
            await upload.done();
        }
        else {
            await this.client.send(new client_s3_1.PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: fileBuffer,
                ContentType: contentType,
            }));
        }
        // Return a public URL if publicBaseUrl is configured, otherwise return the key
        return this.publicBaseUrl
            ? `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`
            : key;
    }
    async download(filePath) {
        const key = filePath.replace(/\\/g, '/');
        const response = await this.client.send(new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        }));
        if (!response.Body) {
            throw new Error(`S3StorageProvider: empty body for key ${key}`);
        }
        return this.streamToBuffer(response.Body);
    }
    async delete(filePath) {
        const key = filePath.replace(/\\/g, '/');
        await this.client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        }));
    }
    async exists(filePath) {
        const key = filePath.replace(/\\/g, '/');
        try {
            await this.client.send(new client_s3_1.HeadObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }));
            return true;
        }
        catch (err) {
            if (err?.name === 'NotFound' || err?.$metadata?.httpStatusCode === 404) {
                return false;
            }
            throw err;
        }
    }
    // ─── Private Helpers ────────────────────────────────────────────────────────
    inferContentType(key) {
        const ext = path_1.default.extname(key).toLowerCase();
        const map = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.mp4': 'video/mp4',
            '.mov': 'video/quicktime',
            '.json': 'application/json',
            '.html': 'text/html',
            '.md': 'text/markdown',
        };
        return map[ext] ?? 'application/octet-stream';
    }
    streamToBuffer(stream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    }
}
exports.S3StorageProvider = S3StorageProvider;
//# sourceMappingURL=s3.js.map