import { Request, Response, NextFunction } from 'express';
import { uploadFile, getFileById } from '../services/file.service';
import { deleteExpiredFiles } from '../services/file.service';
import logger from '../utils/logger';

// Upload PDF file
export const uploadPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await uploadFile(req);
    res.status(201).json({
      success: true,
      data: file,
    });
  } catch (error) {
    logger.error(`Error in uploadPdf: ${error}`);
    next(error);
  }
};

// Get file by ID
export const getFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await getFileById(req.params.id);
    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    logger.error(`Error in getFile: ${error}`);
    next(error);
  }
};

// Cleanup expired files (can be called via cron job)
export const cleanupFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteExpiredFiles();
    res.status(200).json({
      success: true,
      message: 'Expired files cleanup completed',
    });
  } catch (error) {
    logger.error(`Error in cleanupFiles: ${error}`);
    next(error);
  }
};