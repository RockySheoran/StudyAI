import { Request } from 'express';
import File, { IFile } from '../models/file.model';
import cloudinary from '../config/cloudinary';
import logger from '../utils/logger';

// Upload file to Cloudinary and save to database
export const uploadFile = async (req: Request): Promise<IFile> => {
  if (!req.file) {
    throw new Error('No file uploaded');
  }

  const { originalname, size, path } = req.file;

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(path, {
      resource_type: 'raw',
      folder: 'pdf-summaries',
      public_id: `${Date.now()}-${originalname.split('.')[0]}`,
      expiration: Date.now() + 4 * 24 * 60 * 60 * 1000, // 4 days expiration
    });

    // Calculate delete date (4 days from now)
    const deleteDate = new Date();
    deleteDate.setDate(deleteDate.getDate() + 4);

    // Save file info to database
    const newFile = new File({
      originalName: originalname,
      cloudinaryId: result.public_id,
      cloudinaryUrl: result.secure_url,
      uploadDate: new Date(),
      deleteDate,
      size,
    });

    await newFile.save();

    logger.info(`File uploaded successfully: ${newFile._id}`);
    return newFile;
  } catch (error) {
    logger.error(`Error uploading file: ${error}`);
    throw error;
  }
};

// Delete expired files
export const deleteExpiredFiles = async (): Promise<void> => {
  try {
    const now = new Date();
    const expiredFiles = await File.find({ deleteDate: { $lte: now } });

    for (const file of expiredFiles) {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(file.cloudinaryId, { resource_type: 'raw' });
      
      // Delete from database
      await File.findByIdAndDelete(file._id);
      
      logger.info(`Deleted expired file: ${file._id}`);
    }
  } catch (error) {
    logger.error(`Error deleting expired files: ${error}`);
    throw error;
  }
};

// Get file by ID
export const getFileById = async (fileId: string): Promise<IFile | null> => {
  try {
    return await File.findById(fileId);
  } catch (error) {
    logger.error(`Error getting file by ID: ${error}`);
    throw error;
  }
};