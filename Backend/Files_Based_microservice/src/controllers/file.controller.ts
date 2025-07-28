import { Request, Response, NextFunction } from 'express';
import FileService from '../services/file.service';
import { config } from '../config';
import multer from 'multer';
import path from 'path';
import { errorHandler } from '../utils/error-handler';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure file filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (config.allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

// Initialize multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize
  }
});

class FileController {
  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new Error('No file uploaded');
      }

      const savedFile = await FileService.saveFile(req.file);
      res.status(201).json({
        success: true,
        data: savedFile
      });
    } catch (error) {
      errorHandler(error as Error, req, res, next);
    }
  }

  async getFile(req: Request, res: Response, next: NextFunction) {
    try {
      const file = await FileService.getFileById(req.params.id);
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      res.status(200).json({
        success: true,
        data: file
      });
    } catch (error) {
      errorHandler(error as Error, req, res, next);
    }
  }

  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      await FileService.deleteFile(req.params.id);
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      errorHandler(error as Error, req, res, next);
    }
  }
}

export default new FileController();