import { Request, Response } from 'express';
import { getFileById } from '../services/file.service';
import { processPDF, generateSummary } from '../services/llm.service';
import SummaryModel from '../models/summary.model';
import { getPDFInfo } from '../utils/pdfProcessor';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface User {
      id: string;
      // add other user properties if needed
    }
    interface Request {
      user?: User;
    }
  }
}

export const generateFileSummary = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const { query } = req.body;

    

    // Get file from database
    const file = await getFileById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if summary already exists for this query
    const existingSummary = await SummaryModel.findOne({
      fileId: file._id,
      query: query || null,
    });

    if (existingSummary) {
      return res.json({
        summary: existingSummary.summary,
        fromCache: true,
      });
    }

    // Process PDF and generate summary
    const pdfResponse = await fetch(file.cloudinaryUrl);
    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
    const vectorStore = await processPDF(pdfBuffer);
    const summary = await generateSummary(vectorStore, query);

    // Save summary to database
    const newSummary = new SummaryModel({
      fileId: file._id,
      summary,
      userId: req.user?.id, // Assuming you have user authentication
      query: query || undefined,
      modelUsed: 'llama2',
    });
    await newSummary.save();

    res.json({ summary, fromCache: false });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
};

export const getSummaryHistory = async (req: Request, res: Response) => {
  try {
    const summaries = await SummaryModel.find({ userId: req.user?.id })
      .sort({ createdAt: -1 })
      .populate('fileId', 'originalName uploadDate');
    res.json(summaries);
  } catch (error) {
    console.error('Error fetching summary history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};