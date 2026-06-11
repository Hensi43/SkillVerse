import fs from 'fs/promises';
import path from 'path';
import { config } from '../../config/env';

export interface StorageService {
  /**
   * Uploads a file buffer and returns a public URL or local path reference.
   */
  uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string>;
  
  /**
   * Deletes a file based on its identifier or key.
   */
  deleteFile(fileKey: string): Promise<void>;

  /**
   * Generates a signed or public HTTP download URL.
   */
  getDownloadUrl(fileKey: string): Promise<string>;
}

/**
 * Local filesystem implementation for lightweight local development on macOS.
 */
export class LocalStorageService implements StorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = config.uploadDir;
    this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (err) {
      console.error('Failed to create local upload directory:', err);
    }
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const filePath = path.join(this.baseDir, fileName);
    await fs.writeFile(filePath, fileBuffer);
    
    // In local development, return a relative URL that our Express server will serve static-ly.
    // e.g. /uploads/audio-1718012345.webm
    return `/uploads/${fileName}`;
  }

  async deleteFile(fileKey: string): Promise<void> {
    const fileName = path.basename(fileKey);
    const filePath = path.join(this.baseDir, fileName);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.warn(`Could not delete local file ${filePath}:`, err);
    }
  }

  async getDownloadUrl(fileKey: string): Promise<string> {
    // Return the key directly since the Express static server resolves it
    return fileKey;
  }
}

/**
 * AWS S3 compatible implementation (stubbed for MVP/V1, ready for AWS SDK swap).
 */
export class S3StorageService implements StorageService {
  constructor() {
    console.log('AWS S3 Storage Service Initialized.');
    if (!config.aws.accessKeyId || !config.aws.secretAccessKey) {
      console.warn('WARNING: AWS S3 credentials are not set. S3 uploads will operate in mock mode.');
    }
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    if (!config.aws.accessKeyId || !config.aws.secretAccessKey) {
      console.log(`[MOCK AWS S3] Uploading file "${fileName}" (${mimeType}) to bucket: ${config.aws.bucketName}`);
      return `https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucketName}/${fileName}`;
    }

    // In a fully deployed V1 environment, you would run:
    // const client = new S3Client({ region: config.aws.region, credentials: { ... } });
    // await client.send(new PutObjectCommand({ Bucket: config.aws.bucketName, Key: fileName, Body: fileBuffer }));
    throw new Error('AWS S3 SDK Client not integrated. Please install @aws-sdk/client-s3 first.');
  }

  async deleteFile(fileKey: string): Promise<void> {
    console.log(`[MOCK AWS S3] Deleting file "${fileKey}" from bucket: ${config.aws.bucketName}`);
  }

  async getDownloadUrl(fileKey: string): Promise<string> {
    return fileKey;
  }
}

// Factory to export active storage provider based on configuration
let activeStorageService: StorageService;

if (config.storageProvider === 's3') {
  activeStorageService = new S3StorageService();
} else {
  activeStorageService = new LocalStorageService();
}

export { activeStorageService as storageService };
