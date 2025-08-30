import { File } from '../models/file.model';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import { unlink } from 'fs/promises';

import { Summary } from '../models/summary.model';


export const uploadFile = async (file: Express.Multer.File, userId?: string) => {
  try {
    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.path);
    
    // Set deletion time (4 days from now)
    const deleteAt = new Date();
    deleteAt.setDate(deleteAt.getDate() + 4);

    // Save to database
    const newFile = new File({
      originalName: file.originalname,
      cloudinaryId: result.public_id,
      cloudinaryUrl: result.secure_url,
      size: file.size,
      mimetype: file.mimetype,
      deleteAt,
      userId,
    });

    await newFile.save();


    console.log(file.path,"file path")
    // Delete local file
    await unlink(file.path);
    

    return newFile;
  } catch (error) {
    console.error('File upload service error:', error);
    throw error;
  }
};

export const getFileById = async (fileId: string) => {
  return await File.findById(fileId);
};

export const deleteExpiredFiles = async () => {
  try {
    const now = new Date();
    const expiredFiles = await File.find({ deleteAt: { $lte: now } });

    for (const file of expiredFiles) {
      try {
        await deleteFromCloudinary(file.cloudinaryId);
        // await File.findByIdAndDelete(file._id);
        // await Summary.deleteMany({ fileId: file._id });
      } catch (err) {
        console.error(`Error deleting file ${file._id}:`, err);
      }
    }

    return { deletedCount: expiredFiles.length };
  } catch (error) {
    console.error('Error in deleteExpiredFiles:', error);
    throw error;
  }
};




