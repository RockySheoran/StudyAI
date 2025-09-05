import { Request, Response } from 'express';
import { uploadFile, getFileById } from '../services/file.service';
import { createSummaryJob, getSummaryStatus } from '../services/summary.service';
import { summaryQueue } from '../services/queue.service';
import { AuthenticatedRequest } from '../types/custom-types';


/**
 * Handles file upload for document summarization
 * Validates file type, size, and processes the upload through our queue system
 */
export const uploadFileController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please select a valid PDF or DOCX file'
      });
    }

    if (!file.buffer || file.buffer.length === 0) {
      return res.status(400).json({ 
        error: 'File buffer not available or empty',
        message: 'The uploaded file appears to be corrupted or empty. Please try uploading again.'
      });
    }

    // Validate file size (10MB limit for optimal processing)
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ 
        error: 'File too large',
        message: 'File size must be less than 10MB'
      });
    }

    // Validate file extension for supported document types
    const allowedExtensions = ['.pdf', '.docx', '.doc'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({ 
        error: 'Invalid file type',
        message: `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`
      });
    }

    // Upload file to cloud storage
    const uploadedFile: any = await uploadFile(file, userId);
    
    // Create summary processing job
    const summary = await createSummaryJob(uploadedFile._id.toString(), userId);

    // Queue the document for AI summarization
    await summaryQueue.add('processSummary', {
      fileId: uploadedFile._id.toString(),
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      fileId: uploadedFile._id,
      summaryId: summary._id,
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

/**
 * Checks the processing status of a document summary
 * Returns current status: processing, completed, or failed
 */
export const checkSummaryStatus = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const status = await getSummaryStatus(fileId);

    if (status.status === 'not_found') {
      return res.json({status: 'failed', error: 'File or summary not found' });
    }

    res.json(status);
  } catch (error) {
    console.error('Check summary status error:', error);
    res.status(500).json({ error: 'Failed to check summary status' });
  }
};