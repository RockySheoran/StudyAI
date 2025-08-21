import { Queue, Worker } from 'bullmq';
import { generateFileSummary } from './summary.service';

// Redis connection configuration for BullMQ
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};


export const summaryQueue = new Queue('summaryQueue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

export const createSummaryWorker = () => {
  return new Worker(
    'summaryQueue',
    async (job) => {
      const { fileId } = job.data;
      await generateFileSummary(fileId);
    },
    { connection: redisConnection }
  );
};