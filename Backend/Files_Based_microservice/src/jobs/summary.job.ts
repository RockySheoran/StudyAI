import { Queue } from 'bullmq';
import redisClient from '../config/redis';
import logger from '../utils/logger';

export const summaryQueue = new Queue('pdf-summary', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: 100, // Keep last 100 failed jobs
  },
});

// Utility to add job to queue
export const enqueueSummaryJob = async (fileId: string, pdfUrl: string) => {
  return summaryQueue.add('process-pdf', { fileId, pdfUrl }, {
    jobId: fileId, // Use fileId as jobId for idempotency
    priority: 1, // Higher priority = processed sooner
  });
};