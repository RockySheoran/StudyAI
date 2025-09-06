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
    console.log('Upload request received:', {
      userId: req.user?.id,
      hasFile: !!req.file,
      headers: req.headers,
      fileDetails: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        hasBuffer: !!req.file.buffer,
        bufferLength: req.file.buffer?.length
      } : null
    });

    const userId = req.user?.id;
    const file = req.file;

    if (!file) {
      console.error('No file in request');
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please select a valid PDF or DOCX file'
      });
    }

    if (!file.buffer || file.buffer.length === 0) {
      console.error('File buffer issue:', { hasBuffer: !!file.buffer, bufferLength: file.buffer?.length });
      return res.status(400).json({ 
        error: 'File buffer not available or empty',
        message: 'The uploaded file appears to be corrupted or empty. Please try uploading again.'
      });
    }

    // Validate file size (10MB limit for optimal processing)
    if (file.size > 10 * 1024 * 1024) {
      console.error('File too large:', { size: file.size, limit: 10 * 1024 * 1024 });
      return res.status(400).json({ 
        error: 'File too large',
        message: 'File size must be less than 10MB'
      });
    }
    
    console.log('File size validation passed:', file.size);

    // Validate file extension for supported document types
    const allowedExtensions = ['.pdf', '.docx', '.doc'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    console.log('File extension validation:', { extension: fileExtension, allowed: allowedExtensions });
    
    if (!allowedExtensions.includes(fileExtension)) {
      console.error('Invalid file extension:', fileExtension);
      return res.status(400).json({ 
        error: 'Invalid file type',
        message: `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`
      });
    }
    
    console.log('File extension validation passed');

    console.log('Starting file upload to cloud storage...');
    // Upload file to cloud storage
    const uploadedFile: any = await uploadFile(file, userId);
    console.log('File uploaded to cloud storage:', uploadedFile._id);
    
    // Create summary processing job
    console.log('Creating summary job...');
    const summary = await createSummaryJob(uploadedFile._id.toString(), userId);
    console.log('Summary job created:', summary._id);

    // Queue the document for AI summarization
    console.log('Adding to summary queue...');
    await summaryQueue.add('processSummary', {
      fileId: uploadedFile._id.toString(),
    });
    console.log('Successfully added to queue');

    res.status(201).json({
      message: 'File uploaded successfully',
      fileId: uploadedFile._id,
      summaryId: summary._id,
    });
  } catch (error) {
    console.error('File upload error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        return res.status(408).json({ 
          error: 'Upload timeout', 
          message: 'File upload timed out. Please try with a smaller file or check your internet connection.' 
        });
      }
      if (error.message.includes('Cloudinary')) {
        return res.status(503).json({ 
          error: 'Storage service unavailable', 
          message: 'File storage service is temporarily unavailable. Please try again later.' 
        });
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to upload file',
      message: 'An internal server error occurred while processing your file. Please try again.'
    });
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