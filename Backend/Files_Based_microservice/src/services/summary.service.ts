import Summary, { ISummary } from '../models/summary.model';
import File from '../models/file.model';
import logger from '../utils/logger';

// Create a new summary
export const createSummary = async (
  fileId: string,
  summaryText: string,
  keywords: string[]
): Promise<ISummary> => {
  try {
    const newSummary = new Summary({
      fileId,
      summary: summaryText,
      keywords,
      summaryLength: summaryText.length,
    });

    await newSummary.save();
    
    // Update file with page count if available
    await File.findByIdAndUpdate(fileId, { $set: { processed: true } });
    
    logger.info(`Summary created successfully for file: ${fileId}`);
    return newSummary;
  } catch (error) {
    logger.error(`Error creating summary: ${error}`);
    throw error;
  }
};

// Get summary by file ID
export const getSummaryByFileId = async (fileId: string): Promise<ISummary | null> => {
  try {
    return await Summary.findOne({ fileId }).populate('fileId');
  } catch (error) {
    logger.error(`Error getting summary by file ID: ${error}`);
    throw error;
  }
};