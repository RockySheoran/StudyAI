import { deleteExpiredFiles } from '../services/file.service';
import { Summary } from '../models/summary.model';

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