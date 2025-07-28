import File from '../models/file.model';
import { config } from '../config';
import { createUploadDir } from '../utils/file-utils';
import { IFile } from '../models/file.model';
import fs from 'fs';
import path from 'path';
import express from 'express';

class FileService {
  constructor() {
    createUploadDir();
  }

  async saveFile(file: Express.Multer.File): Promise<IFile> {
    const newFile = new File({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    });

    return await newFile.save();
  }

  async getFileById(id: string): Promise<IFile | null> {
    return await File.findById(id);
  }

  async deleteFile(id: string): Promise<void> {
    const file = await File.findById(id);
    if (!file) {
      throw new Error('File not found');
    }

    // Delete file from filesystem
    const filePath = path.join(config.uploadDir, file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await File.findByIdAndDelete(id);
  }
}

export default new FileService();