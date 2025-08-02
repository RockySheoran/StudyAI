import { Summary } from '../models/summary.model';
import { File } from '../models/file.model';
import { generateSummary } from '../config/gemini';

import { redisClient } from '../config/redis';
import { extractTextFromPdf } from '../utils/file.utils';

export const createSummaryJob = async (fileId: string, userId?: string) => {
  try {
    // Create initial summary record
    const summary = new Summary({
      fileId,
      status: 'pending',
      userId,
    });
    await summary.save();
    console.log(summary,"summary")

    // Cache the initial state
    await redisClient.set(`summary:${fileId}`, JSON.stringify({
      status: 'pending',
      summaryId: summary._id.toString(),
    }));

    return summary;
  } catch (error) {
    console.error('Error creating summary job:', error);
    throw error;
  }
};

export const generateFileSummary = async (fileId: string) => {
  try {
    const file = await File.findById(fileId);
    if (!file) throw new Error('File not found');

    let summary = await Summary.findOne({ fileId });
    if (!summary) {
      summary = new Summary({ fileId, status: 'pending' });
      await summary.save();
    }

    // Extract text from PDF (implementation in utils/file.utils.ts)
    const text = await extractTextFromPdf(file.cloudinaryUrl);

    // Generate summary using Gemini
    const summaryContent = await generateSummary(text);

    // Update summary record
    summary.content = summaryContent;
    summary.status = 'completed';
    summary.generatedAt = new Date();
    await summary.save();

    // Update cache
    await redisClient.set(`summary:${fileId}`, JSON.stringify({
      status: 'completed',
      content: summaryContent,
      summaryId: summary._id.toString(),
    }));

    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);

    // Update status to failed if something went wrong
    await Summary.findOneAndUpdate(
      { fileId },
      { status: 'failed' },
      { upsert: true }
    );

    await redisClient.set(`summary:${fileId}`, JSON.stringify({
      status: 'failed',
    }));

    throw error;
  }
};

export const getSummaryStatus = async (fileId: string) => {
  try {
    // First check Redis cache
    const cachedSummary = await redisClient.get(`summary:${fileId}`);
    if (cachedSummary) {
      return JSON.parse(cachedSummary);
    }

    // Fallback to database
    const summary = await Summary.findOne({ fileId });
    if (!summary) return { status: 'not_found' };

    const result = {
      status: summary.status,
      content: summary.content,
      summaryId: summary._id.toString(),
    };

    // Cache the result
    await redisClient.set(`summary:${fileId}`, JSON.stringify(result));

    return result;
  } catch (error) {
    console.error('Error getting summary status:', error);
    throw error;
  }
};