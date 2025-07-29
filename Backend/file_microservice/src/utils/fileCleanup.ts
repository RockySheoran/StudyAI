import { deleteFile, getFilesToDelete } from '../services/file.service';
import { scheduleJob } from 'node-schedule';

export const setupFileCleanupJob = () => {
  // Run every day at midnight
  scheduleJob('0 0 * * *', async () => {
    try {
      const filesToDelete = await getFilesToDelete();
      for (const file of filesToDelete) {
        await deleteFile(file._id.toString());
        console.log(`Deleted file ${file.originalName}`);
      }
    } catch (error) {
      console.error('Error in file cleanup job:', error);
    }
  });
};