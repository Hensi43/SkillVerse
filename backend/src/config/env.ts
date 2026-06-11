import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/skillverse',
  redisHost: process.env.REDIS_HOST || '127.0.0.1',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  jwtSecret: process.env.JWT_SECRET || 'skillverse-super-secret-access-token-key-2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'skillverse-super-secret-refresh-token-key-2026',
  mockOtp: process.env.MOCK_OTP !== 'false', // Default true
  storageProvider: process.env.STORAGE_PROVIDER || 'local', // 'local' | 's3'
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'ap-south-1',
    bucketName: process.env.AWS_S3_BUCKET || 'skillverse-assets',
  },
  ai: {
    openaiKey: process.env.OPENAI_API_KEY || '',
  }
};
