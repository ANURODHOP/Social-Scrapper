// src/providers/storage/local.ts
import { StorageProvider } from './base';
import fs from 'fs';
import path from 'path';

export class LocalStorageProvider implements StorageProvider {
  private readonly rootPath: string;

  constructor(rootPath?: string) {
    this.rootPath = rootPath ?? path.join(process.cwd(), 'storage');
    if (!fs.existsSync(this.rootPath)) {
      fs.mkdirSync(this.rootPath, { recursive: true });
    }
  }

  /**
   * Helper to build a canonical path: storage/<provider>/<profile>/<postId>/<filename>
   */
  public buildStructuredPath(
    providerName: string,
    profileIdentifier: string,
    postId: string,
    subPath: string
  ): string {
    return path.join(providerName, profileIdentifier, postId, subPath);
  }

  private getFullPath(filePath: string): string {
    return path.join(this.rootPath, filePath);
  }

  async upload(fileBuffer: Buffer, filePath: string): Promise<string> {
    const fullPath = this.getFullPath(filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    await fs.promises.writeFile(fullPath, fileBuffer);
    return filePath; // return relative path
  }

  async download(filePath: string): Promise<Buffer> {
    const fullPath = this.getFullPath(filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`LocalStorageProvider: file not found at ${fullPath}`);
    }
    return fs.promises.readFile(fullPath);
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = this.getFullPath(filePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  async exists(filePath: string): Promise<boolean> {
    return fs.existsSync(this.getFullPath(filePath));
  }
}