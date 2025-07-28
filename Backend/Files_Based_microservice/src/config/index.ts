import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 8001  ,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pdf-summary',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) * 1024 * 1024 : 5 * 1024 * 1024, // 5MB
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES ? process.env.ALLOWED_FILE_TYPES.split(',') : ['application/pdf']
};