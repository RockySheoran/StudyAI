// import { Request, Response, NextFunction } from 'express';
// import { enqueueSummaryJob } from '../jobs/summary.job';
// import { getSummaryByFileId } from '../services/summary.service';
// import { getFileById } from '../services/file.service';
// import logger from '../utils/logger';
// import { summaryQueue } from '../jobs/summary.job';

// // Generate summary for a PDF (now queues the job)
// export const generatePdfSummary = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const fileId = req.params.id;
//     logger.info(`Request to generate summary for file: ${fileId}`);

//     if (!fileId) {
//       logger.warn('File ID is required');
//       return res.status(400).json({ success: false, error: 'File ID is required' });
//     }

//     // Get file from database
//     const file = await getFileById(fileId);
//     if (!file) {
//       logger.warn(`File not found with ID: ${fileId}`);
//       return res.status(404).json({ success: false, error: 'File not found' });
//     }

//     // Check if summary already exists
//     const existingSummary = await getSummaryByFileId(fileId);
//     if (existingSummary) {
//       logger.info(`Summary already exists for file: ${fileId}`);
//       return res.status(200).json({
//         success: true,
//         data: existingSummary,
//         message: 'Summary already exists',
//       });
//     }

//     // Enqueue the job instead of processing immediately
//     await enqueueSummaryJob(fileId, file.cloudinaryUrl);
//     logger.info(`Job enqueued for file: ${fileId}`);

//     res.status(202).json({
//       success: true,
//       status: 'queued',
//       message: 'PDF is being processed. Check back later.',
//       jobId: fileId,
//     });

//   } catch (error) {
//     logger.error(`Error in generatePdfSummary: ${error}`);
//     next(error);
//   }
// };

// // Get summary by file ID (with Redis caching)
// export const getPdfSummary = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const fileId = req.params.id;
//     logger.info(`Fetching summary for file: ${fileId}`);

//     const summary = await getSummaryByFileId(fileId);
//     if (!summary) {
//       logger.warn(`Summary not found for file: ${fileId}`);
//       return res.status(404).json({ 
//         success: false, 
//         error: 'Summary not found' 
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: summary,
//     });

//   } catch (error) {
//     logger.error(`Error in getPdfSummary: ${error}`);
//     next(error);
//   }
// };

// // Check job status
// export const getJobStatus = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const jobId = req.params.id;
//     logger.info(`Checking job status for: ${jobId}`);

//     const job = await summaryQueue.getJob(jobId);
//     if (!job) {
//       logger.warn(`Job not found: ${jobId}`);
//       return res.status(404).json({ 
//         success: false, 
//         error: 'Job not found' 
//       });
//     }

//     const state = await job.getState();
//     const progress = job.progress;
//     const result = state === 'completed' ? job.returnvalue : undefined;

//     logger.debug(`Job ${jobId} status: ${state}, progress: ${progress}`);

//     res.status(200).json({
//       success: true,
//       status: state,
//       progress,
//       result,
//       ...(state === 'failed' && { 
//         error: job.failedReason 
//       }),
//     });

//   } catch (error) {
//     logger.error(`Error getting job status: ${error}`);
//     next(error);
//   }
// };
import { Request, Response, NextFunction } from 'express';
import { generateSummary } from '../services/gemini.service';
import { createSummary, getSummaryByFileId } from '../services/summary.service';
import { getFileById } from '../services/file.service';
import logger from '../utils/logger';

// Generate summary for a PDF
export const generatePdfSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileId = req.params.id;
    console.log(fileId);
    if (!fileId) {
      return res.status(400).json({ success: false, error: 'File ID is required' });
    }
    
    // Get file from database
    const file = await getFileById(fileId);
    
    if (!file) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }
    
    // Check if summary already exists
    const existingSummary = await getSummaryByFileId(fileId);
    console.log(existingSummary," existingSummary");
    if (existingSummary) {
      return res.status(200).json({
        success: true,
        data: existingSummary,
        message: 'Summary already exists',
      });
    }
    
    // Generate summary using Gemini
    const { summary, keywords } = await generateSummary(file.cloudinaryUrl);
    console.log(summary, "summary");
    console.log(keywords, "keywords");
    // Save summary to database
    const newSummary = await createSummary(fileId, summary, keywords);
    
    res.status(201).json({
      success: true,
      data: newSummary,
    });
  } catch (error) {
    logger.error(`Error in generatePdfSummary: ${error}`);
    next(error);
  }
};

// Get summary by file ID
export const getPdfSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await getSummaryByFileId(req.params.id);
    if (!summary) {
      return res.status(404).json({ success: false, error: 'Summary not found' });
    }
    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error(`Error in getPdfSummary: ${error}`);
    next(error);
  }
};