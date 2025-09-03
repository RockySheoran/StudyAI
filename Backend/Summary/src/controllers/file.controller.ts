import { Request, Response } from 'express';
import { uploadFile, getFileById } from '../services/file.service';
import { createSummaryJob, getSummaryStatus } from '../services/summary.service';
import { summaryQueue } from '../services/queue.service';
import { AuthenticatedRequest } from '../types/custom-types';


export const uploadFileController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    console.log('Summary upload attempt:', {
      userId,
      hasFile: !!file,
      fileDetails: file ? {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        hasBuffer: !!file.buffer
      } : null
    });

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

    // Additional validation for mobile uploads
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        error: 'File too large',
        message: 'File size must be less than 5MB'
      });
    }

    const uploadedFile : any = await uploadFile(file, userId);
    console.log(uploadedFile)
    
    // Create summary job
    const summary = await createSummaryJob(uploadedFile._id.toString(), userId);
    console.log(summary,"djkgdsijhdsfieuo")

    // Add to processing queue
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

export const checkSummaryStatus = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const status = await getSummaryStatus(fileId);
    console.log(status,"statusassdfdgsfdgsrdgdsfgdsfggsfdggf")

    if (status.status === 'not_found') {
      return res.json({status: 'failed', error: 'File or summary not found' });
    }

    res.json(status);
  } catch (error) {
    console.error('Check summary status error:', error);
    res.status(500).json({ error: 'Failed to check summary status' });
  }
};