import { Request, Response } from 'express';
import { uploadFile } from '../services/file.service';
import { createSummaryJob, getSummaryStatus } from '../services/summary.service';
import { summaryQueue } from '../services/queue.service';
import { AuthenticatedRequest } from '../types/custom-types';
import { FILE_LIMITS, MESSAGES } from '../utils/constants';
import { sendSuccess, sendError, sendValidationError, sendNotFound } from '../utils/response';


// Helper function to validate file
const validateFile = (file: Express.Multer.File) => {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'No file uploaded', message: 'Please select a valid PDF or DOCX file' };
  }

  // Check file buffer
  if (!file.buffer || file.buffer.length === 0) {
    return { 
      isValid: false, 
      error: 'File buffer not available or empty',
      message: 'The uploaded file appears to be corrupted or empty. Please try uploading again.'
    };
  }

  // Check file size using constant
  if (file.size > FILE_LIMITS.MAX_SIZE) {
    return { 
      isValid: false, 
      error: 'File too large',
      message: `File size must be less than ${FILE_LIMITS.MAX_SIZE / (1024 * 1024)}MB`
    };
  }

  // Check file extension using constants
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  
  if (!FILE_LIMITS.ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return { 
      isValid: false, 
      error: 'Invalid file type',
      message: `Invalid file extension. Allowed: ${FILE_LIMITS.ALLOWED_EXTENSIONS.join(', ')}`
    };
  }

  return { isValid: true };
};

// Helper function to handle errors
const handleUploadError = (error: any, res: Response) => {
  console.error('File upload error:', error);
  
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
  
  return res.status(500).json({ 
    error: 'Failed to upload file',
    message: 'An internal server error occurred while processing your file. Please try again.'
  });
};

/**
 * Handles file upload for document summarization
 * Validates file type, size, and processes the upload through our queue system
 */
export const uploadFileController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    // Validate the uploaded file
    const validation = validateFile(file!);
    if (!validation.isValid) {
      return sendValidationError(res, [validation.error!], validation.message);
    }

    console.log('File validation passed:', {
      name: file!.originalname,
      size: file!.size,
      type: file!.mimetype
    });

    // Upload file to cloud storage
    const uploadedFile = await uploadFile(file!, userId);
    console.log('File uploaded successfully:', uploadedFile._id);
    
    // Create summary processing job
    const summary = await createSummaryJob(uploadedFile._id.toString(), userId);
    console.log('Summary job created:', summary._id);

    // Add to processing queue
    await summaryQueue.add('processSummary', {
      fileId: uploadedFile._id.toString(),
    });

    return sendSuccess(res, {
      fileId: uploadedFile._id,
      summaryId: summary._id,
    }, MESSAGES.FILE_UPLOAD_SUCCESS, 201);
  } catch (error) {
    return handleUploadError(error, res);
  }
};

/**
 * Checks the processing status of a document summary
 * Returns current status: processing, completed, or failed
 */
export const checkSummaryStatus = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    
    // fileId is already validated by middleware
    console.log('Checking summary status for fileId:', fileId);

    const status = await getSummaryStatus(fileId);
    console.log(status)

    if (status.status === 'not_found') {
      return sendNotFound(res, 'File or summary', 'The requested file or summary could not be found');
    }

    return sendSuccess(res, status);
  } catch (error) {
    console.error('Check summary status error:', error);
    return sendError(res, 'Failed to check summary status', 'An error occurred while checking the summary status');
  }
};