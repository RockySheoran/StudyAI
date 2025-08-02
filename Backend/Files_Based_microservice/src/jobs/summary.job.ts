import { createSummaryWorker } from '../services/queue.service';

export const initializeSummaryWorker = () => {
  const worker = createSummaryWorker();

  worker.on('completed', (job) => {
    console.log(`Summary job completed for file ${job.data.fileId}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Summary job failed for file ${job?.data.fileId}:`, err);
  });

  return worker;
};