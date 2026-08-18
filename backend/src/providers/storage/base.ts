// src/providers/storage/base.ts
export interface StorageProvider {
  /**
   * Upload a file to storage.
   * @param fileBuffer - Buffer containing the file data
   * @param filePath - Path where the file should be stored (relative to the storage root)
   * @returns Promise resolving to the stored file's URL or path
   */
  upload(fileBuffer: Buffer, filePath: string): Promise<string>;

  /**
   * Download a file from storage.
   * @param filePath - Path of the file to download (relative to the storage root)
   * @returns Promise resolving to the file buffer
   */
  download(filePath: string): Promise<Buffer>;

  /**
   * Delete a file from storage.
   * @param filePath - Path of the file to delete (relative to the storage root)
   * @returns Promise resolving to void
   */
  delete(filePath: string): Promise<void>;

  /**
   * Check if a file exists in storage.
   * @param filePath - Path of the file to check (relative to the storage root)
   * @returns Promise resolving to boolean
   */
  exists(filePath: string): Promise<boolean>;
}