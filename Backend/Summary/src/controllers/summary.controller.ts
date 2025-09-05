import { Request, Response } from 'express';
import { Summary } from '../models/summary.model';
import { File } from '../models/file.model';
import { AuthenticatedRequest } from '../types/custom-types';

/**
 * Retrieves a completed summary by ID
 * Returns the summary content along with associated file information
 */
export const getSummaryController = async (req: Request, res: Response): Promise<any> => {
  try {
    const { summaryId } = req.params;
    const summary: any = await Summary.findById(summaryId).populate('fileId');

    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }

    if (summary.status !== 'completed') {
      return res.status(200).json({
        status: summary.status,
        message: 'Summary is still being processed',
      });
    }

    res.json({
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
    res.status(500).json({ error: 'Failed to get summary' });
  }
};

/**
 * Retrieves user's summary history
 * Returns all summaries for the authenticated user, sorted by most recent first
 */
export const getSummaryHistory = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.user!;
    const summaries = await Summary.find({ userId: id })
      .sort({ generatedAt: -1 });
    
    res.json(summaries);
  } catch (error) {
    console.error('Get summary history error:', error);
    res.status(500).json({ error: 'Failed to get summary history' });
  }
}

/**
 * Deletes a summary and its associated file
 * Removes both the summary record and the uploaded file from storage
 */
export const deleteSummary = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { summaryId } = req.params;
    const summary = await Summary.findByIdAndDelete(summaryId);
    
    if (!summary) {
      return res.status(404).json({ error: 'Summary not found' });
    }
    
    // Clean up associated file record
    const fileId = summary.fileId;
    await File.findByIdAndDelete(fileId);
    
    res.json({ message: 'Summary deleted successfully' });
  } catch (error) {
    console.error('Delete summary error:', error);
    res.status(500).json({ error: 'Failed to delete summary' });
  }
};