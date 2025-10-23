import { Summary } from '../models/summary.model';
import { File } from '../models/file.model';
import { generateSummary, generateChunkSummary, generateFinalSummary } from '../config/gemini';
import { extractTextFromFile, chunkTextForProcessing } from '../utils/file.utils';
import { CACHE_SETTINGS } from '../utils/constants';
import { RedisCache } from '../utils/redis.utils';

// Helper function to set cache with expiry based on status
const setCacheWithExpiry = async (key: string, data: any, status: string) => {
  try {
    let ttl: number;
    
    switch (status) {
      case 'completed':
        ttl = CACHE_SETTINGS.SUMMARY_COMPLETED_TTL;
        break;
      case 'failed':
        ttl = CACHE_SETTINGS.SUMMARY_FAILED_TTL;
        break;
      case 'pending':
      case 'processing':
      default:
        ttl = CACHE_SETTINGS.SUMMARY_PENDING_TTL;
        break;
    }
    
    // Use the Redis utility for consistent caching
    await RedisCache.set(key, JSON.stringify(data), ttl);
    console.log(`Cache set for ${key} with status: ${status}, TTL: ${ttl} seconds`);
  } catch (error) {
    console.warn('Failed to set cache:', error);
  }
};

// Helper function to clear cache
const clearCache = async (fileId: string, summaryId?: string) => {
  try {
    await RedisCache.delete(`summary:${fileId}`);
    if (summaryId) {
      await RedisCache.delete(`summary_detail:${summaryId}`);
    }
    console.log(`Cache cleared for fileId: ${fileId}`);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
};

export const createSummaryJob = async (fileId: string, userId?: string) => {
  try {
    // Create initial summary record
    const summary = new Summary({
      fileId,
      status: 'pending',
      userId,
    });
    await summary.save();
    console.log(summary, "summary")

    // Cache the initial state with expiry
    await setCacheWithExpiry(`summary:${fileId}`, {
      status: 'pending',
      summaryId: summary._id.toString(),
    }, 'pending');

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

    // Update status to processing
    summary.status = 'pending';
    await summary.save();

    // Update cache to show processing status with expiry
    await setCacheWithExpiry(`summary:${fileId}`, {
      status: 'processing',
      summaryId: summary._id.toString(),
    }, 'processing');

    // Extract text from file (supports PDF, DOCX, DOC)
    const text = await extractTextFromFile(file.cloudinaryUrl, file.originalName);
    console.log(text)
    console.log(`Extracted text length: ${text.length} characters`);

    let summaryContent: string;

    // Check if text is large enough to require chunking
    if (text.length > 8000) { // If text is large, use chunking approach
      console.log('Large document detected, checking chunk count...');

      // Split text into manageable chunks using LangChain
      const chunks = await chunkTextForProcessing(text);
      console.log(`Document will be split into ${chunks.length} chunks`);

      // Check if chunk count exceeds limit
      if (chunks.length > 10) {
        console.log(`File too large: ${chunks.length} chunks (limit: 10)`);

        // Update summary status to failed with specific message
        summary.status = 'failed';
        summary.content = `File is too large to process. This document would require ${chunks.length} chunks for processing (maximum allowed: 10 chunks). Please upload a smaller document (recommended: under 50 pages).`;
        await summary.save();

        // Update cache with failure message and expiry
        await setCacheWithExpiry(`summary:${fileId}`, {
          status: 'failed',
          error: 'file_too_large',
          message: `File is too large to process. This document would require ${chunks.length} chunks for processing (maximum allowed: 10 chunks). Please upload a smaller document (recommended: under 50 pages).`,
          summaryId: summary._id.toString(),
        }, 'failed');

        return summary;

        // throw new Error(`File too large: ${chunks.length} chunks exceeds limit of 10`);
      }

      console.log('Chunk count within limits, proceeding with processing...');

      // Process each chunk to generate individual summaries
      const chunkSummaries: string[] = [];
      const chunkDetails: Array<{
        index: number;
        wordCount: number;
        charCount: number;
        summary: string;
      }> = [];

      for (let i = 0; i < chunks.length; i++) {
        console.log(`Processing chunk ${i + 1}/${chunks.length}`);
        const chunk = chunks[i];
        const wordCount = chunk.split(/\s+/).filter(word => word.length > 0).length;
        const charCount = chunk.length;

        const chunkSummary = await generateChunkSummary(chunk, i, chunks.length);
        chunkSummaries.push(chunkSummary);

        chunkDetails.push({
          index: i + 1,
          wordCount,
          charCount,
          summary: chunkSummary
        });

        console.log(`Chunk ${i + 1}: ${wordCount} words, ${charCount} characters`);

        // Small delay to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Calculate total statistics
      const totalWords = chunkDetails.reduce((sum, chunk) => sum + chunk.wordCount, 0);
      const totalChars = chunkDetails.reduce((sum, chunk) => sum + chunk.charCount, 0);

      // Combine all chunk summaries into a final comprehensive summary
      const finalSummary = await generateFinalSummary(chunkSummaries);

      // Create structured summary with chunk information
      summaryContent = `# Document Summary

## Processing Statistics
- **Total Chunks Processed:** ${chunks.length}
- **Total Words:** ${totalWords.toLocaleString()}
- **Total Characters:** ${totalChars.toLocaleString()}
- **Average Words per Chunk:** ${Math.round(totalWords / chunks.length)}

## Comprehensive Summary
${finalSummary}

## Detailed Chunk Analysis
${chunkDetails.map(chunk =>
        `### Section ${chunk.index}
**Words:** ${chunk.wordCount} | **Characters:** ${chunk.charCount}

${chunk.summary}`
      ).join('\n\n')}

---
*Generated using AI-powered chunked processing for optimal analysis of large documents.*`;

      console.log('Generated structured summary with chunk details');

    } else {
      // For smaller documents, use the original approach
      console.log('Small document detected, using direct approach');
      summaryContent = await generateSummary(text);
    }

    // Update summary record
    summary.content = summaryContent;
    summary.status = 'completed';
    summary.generatedAt = new Date();
    await summary.save();

    // Update cache with completed status and longer expiry
    await setCacheWithExpiry(`summary:${fileId}`, {
      status: 'completed',
      content: summaryContent,
      summaryId: summary._id.toString(),
      generatedAt: summary.generatedAt
    }, 'completed');

    console.log('Summary generation completed successfully');
    return summary;
  } catch (error: any) {
    console.error('Error generating summary:', error);

    // Determine appropriate error message based on error type
    let errorMessage = "An error occurred while processing your file. Please try again.";
    let errorType = "processing_error";

    if (error.message?.includes('corrupted') || error.message?.includes('invalid format')) {
      errorMessage = "The PDF file appears to be corrupted or has an invalid format. Please try uploading a different PDF file.";
      errorType = "invalid_pdf";
    } else if (error.message?.includes('password-protected')) {
      errorMessage = "The PDF file is password-protected. Please upload an unprotected PDF file.";
      errorType = "password_protected";
    } else if (error.message?.includes('no extractable text')) {
      errorMessage = "The PDF file contains no extractable text content. Please ensure the PDF contains readable text.";
      errorType = "no_text_content";
    } else if (error.message?.includes('network timeout') || error.message?.includes('download')) {
      errorMessage = "Failed to download the PDF file. Please check your internet connection and try again.";
      errorType = "download_error";
    } else if (error.message?.includes('file not found')) {
      errorMessage = "The PDF file could not be found. It may have been deleted or moved.";
      errorType = "file_not_found";
    }

    // Update status to failed with appropriate error message
    await Summary.findOneAndUpdate(
      { fileId },
      { 
        status: 'failed',
        content: errorMessage
      },
      { upsert: true }
    );

    await setCacheWithExpiry(`summary:${fileId}`, {
      status: 'failed',
      error: errorType,
      message: errorMessage
    }, 'failed');

    throw error;
  }
};

export const getSummaryStatus = async (fileId: string) => {
  try {
    // Enhanced validation for fileId parameter
    if (!fileId || fileId === 'undefined' || fileId === 'null' || fileId.trim() === '') {
      console.error('Invalid fileId provided:', fileId);
      return { 
        status: 'not_found', 
        error: 'Invalid file ID',
        message: 'File ID is missing or invalid'
      };
    }

    
    // First check Redis cache with error handling
    const cachedSummary = await RedisCache.get(`summary:${fileId}`);
    if (cachedSummary) {
      console.log('Cache hit for fileId:', fileId);
    }
    console.log("a,vmnskdk",cachedSummary)
    if (cachedSummary) {
      return JSON.parse(cachedSummary);
    }

    // Fallback to database with optimized query
    const summary = await Summary.findOne({ fileId })
      .select('status content _id generatedAt')
      .lean();
      console.log(summary,"jvndkjkf")
      
      
    if (!summary) return { status: 'not_found' };

    const result = {
      status: summary.status,
      content: summary.content,
      summaryId: summary._id.toString(),
      generatedAt: summary.generatedAt
    };

    // Cache the result with appropriate expiry
    await setCacheWithExpiry(`summary:${fileId}`, result, summary.status);
    
    return result;
  } catch (error) {
    console.error('Error getting summary status:', error);
    throw error;
  }
};

// Function to delete summary with cache clearing
export const deleteSummaryWithCache = async (summaryId: string, userId?: string) => {
  try {
    // Find summary first to get fileId
    const summary = await Summary.findOne({ 
      _id: summaryId, 
      ...(userId && { userId }) 
    });
    
    if (!summary) {
      return { success: false, error: 'Summary not found' };
    }

    // Delete from database
    await Promise.all([
      Summary.findByIdAndDelete(summaryId),
      File.findByIdAndDelete(summary.fileId)
    ]);

    // Clear cache
    await clearCache(summary.fileId.toString(), summaryId);

    return { success: true, deletedId: summaryId };
  } catch (error) {
    console.error('Error deleting summary:', error);
    throw error;
  }
};