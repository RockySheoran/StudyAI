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