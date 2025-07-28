import fs from 'fs';
import path from 'path';
import { config } from '../config';

export const createUploadDir = () => {
  if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
  }
};

export const cleanUpFiles = async () => {
  try {
    const files = fs.readdirSync(config.uploadDir);
    for (const file of files) {
      const filePath = path.join(config.uploadDir, file);
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up files:', error);
  }
};