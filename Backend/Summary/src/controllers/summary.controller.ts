import { Request, Response } from 'express';
import { Summary } from '../models/summary.model';
import { File } from '../models/file.model';
import { AuthenticatedRequest } from '../types/custom-types';
import { PAGINATION, MESSAGES } from '../utils/constants';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';
import { deleteSummaryWithCache } from '../services/summary.service';

/**
 * Retrieves a completed summary by ID
 * Returns the summary content along with associated file information
 */
export const getSummaryController = async (req: Request, res: Response): Promise<any> => {
  try {
    const { summaryId } = req.params;
    const summary: any = await Summary.findById(summaryId).populate('fileId');

    if (!summary) {
      return sendNotFound(res, 'Summary');
    }

    if (summary.status !== 'completed') {
      return sendSuccess(res, {
        status: summary.status,
        message: 'Summary is still being processed'
      });
    }

    return sendSuccess(res, {
      status: 'completed',
      summary: summary.content,
      file: {
        id: summary.fileId._id,
        name: (summary.fileId as any).originalName,
        url: (summary.fileId as any).cloudinaryUrl,
      },
    });
  } catch (error) {
    console.error('Get summary error:', error);
    return sendError(res, 'Failed to get summary', MESSAGES.INTERNAL_ERROR);
  }
};

/**
 * Retrieves user's summary history with pagination
 * Returns paginated summaries for the authenticated user, sorted by most recent first
 */
export const getSummaryHistory = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.user!;
    const page = parseInt(req.query.page as string) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit as string) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    // Get summaries and total count
    const [summaries, totalCount] = await Promise.all([
      Summary.find({ userId: id })
        .select('fileId content generatedAt status')
        .populate('fileId', 'originalName size mimetype uploadDate')
        .sort({ generatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Summary.countDocuments({ userId: id })
    ]);
    
    return sendSuccess(res, {
      summaries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
        limit
      }
    });
  } catch (error) {
    console.error('Get summary history error:', error);
    return sendError(res, 'Failed to get summary history', MESSAGES.INTERNAL_ERROR);
  }
}

/**
 * Deletes a summary and its associated file
 * Removes both the summary record and the uploaded file from storage
 */
export const deleteSummary = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { summaryId } = req.params;
    const userId = req.user?.id;
    
    // Validate summaryId parameter
    if (!summaryId) {
      return sendError(res, 'Missing summary ID', 'Summary ID is required for deletion', 400);
    }

    // Delete summary with cache clearing
    const result = await deleteSummaryWithCache(summaryId, userId);
    
    if (!result.success) {
      return sendNotFound(res, 'Summary', 'The requested summary could not be found or you do not have permission to delete it');
    }

    return sendSuccess(res, { deletedId: result.deletedId }, MESSAGES.SUMMARY_DELETED);
  } catch (error) {
    console.error('Delete summary error:', error);
    return sendError(res, 'Failed to delete summary', MESSAGES.INTERNAL_ERROR);
  }
};