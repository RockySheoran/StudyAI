import { Resume } from "../models/resume.model";
import { deleteFromCloudinary } from "../config/cloudinary";

export const startCleanupJob = () => {
  // Run every 6 hours
  setInterval(async () => {
    try {
      console.log('Running cleanup job...');
      const result = await deleteExpiredFiles();
      console.log(`Cleanup job completed. Deleted ${result.deletedCount} files.`);
    } catch (error) {
      console.error('Cleanup job error:', error);
    }
  }, 6 * 60 * 60 * 1000);
};

export const deleteExpiredFiles = async () => {
  try {
    const now = new Date();
    const expiredFiles = await Resume.find({ deleteAt: { $lte: now } });

    for (const file of expiredFiles) {
      try {
        await deleteFromCloudinary(file.publicId);
       
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