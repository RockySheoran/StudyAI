import Summary, { ISummary } from '../models/summary.model';
import File from '../models/file.model';
import logger from '../utils/logger';
import { getFromCache, setToCache } from './cache.service';


const CACHE_PREFIX = 'summary:';
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
    await setToCache(`${CACHE_PREFIX}${fileId}`, newSummary);
    
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
    const cachedSummary = await getFromCache<ISummary>(`${CACHE_PREFIX}${fileId}`);


    if (cachedSummary) {
      logger.debug(`Cache hit for summary ${fileId}`);
      return cachedSummary;
    }
    const summary = await Summary.findOne({ fileId }).populate('fileId');
    if (summary) {
      // Cache the result
      await setToCache(`${CACHE_PREFIX}${fileId}`, summary);
    }

    return summary;
  } catch (error) {
    logger.error(`Error getting summary by file ID: ${error}`);
    throw error;
  }
};