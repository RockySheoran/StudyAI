import { Worker } from 'bullmq';
import redisClient from '../config/redis';
import { generateSummary } from '../services/gemini.service';
import { createSummary } from '../services/summary.service';
import { getFileById } from '../services/file.service';
import logger from '../utils/logger';

const worker = new Worker('pdf-summary', async job => {
  try {
    const { fileId, pdfUrl } = job.data;
    logger.info(`Processing job ${job.id} for file ${fileId}`);
    
    // Check if file still exists
    const file = await getFileById(fileId);
    if (!file) {
      throw new Error(`File ${fileId} not found`);
    }
    
    // Process summary
    const { summary, keywords } = await generateSummary(pdfUrl);
    await createSummary(fileId, summary, keywords);
    
    logger.info(`Successfully processed job ${job.id}`);
    return { success: true, fileId };
  } catch (error) {
    logger.error(`Job ${job.id} failed:`, error);
    throw error; // Will trigger retry
  }
}, {
  connection: redisClient,
  concurrency: 5, // Process 5 jobs concurrently
  limiter: {
    max: 10, // Max 10 jobs per second
    duration: 1000,
  },
});

worker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed with error:`, err);
});