"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageProvider = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class LocalStorageProvider {
    constructor(rootPath) {
        this.rootPath = rootPath ?? path_1.default.join(process.cwd(), 'storage');
        if (!fs_1.default.existsSync(this.rootPath)) {
            fs_1.default.mkdirSync(this.rootPath, { recursive: true });
        }
    }
    /**
     * Helper to build a canonical path: storage/<provider>/<profile>/<postId>/<filename>
     */
    buildStructuredPath(providerName, profileIdentifier, postId, subPath) {
        return path_1.default.join(providerName, profileIdentifier, postId, subPath);
    }
    getFullPath(filePath) {
        return path_1.default.join(this.rootPath, filePath);
    }
    async upload(fileBuffer, filePath) {
        const fullPath = this.getFullPath(filePath);
        const dir = path_1.default.dirname(fullPath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        await fs_1.default.promises.writeFile(fullPath, fileBuffer);
        return filePath; // return relative path
    }
    async download(filePath) {
        const fullPath = this.getFullPath(filePath);
        if (!fs_1.default.existsSync(fullPath)) {
            throw new Error(`LocalStorageProvider: file not found at ${fullPath}`);
        }
        return fs_1.default.promises.readFile(fullPath);
    }
    async delete(filePath) {
        const fullPath = this.getFullPath(filePath);
        if (fs_1.default.existsSync(fullPath)) {
            await fs_1.default.promises.unlink(fullPath);
        }
    }
    async exists(filePath) {
        return fs_1.default.existsSync(this.getFullPath(filePath));
    }
}
exports.LocalStorageProvider = LocalStorageProvider;
//# sourceMappingURL=local.js.map