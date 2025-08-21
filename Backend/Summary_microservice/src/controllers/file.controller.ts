import { Request, Response } from 'express';
import { uploadFile, getFileById } from '../services/file.service';
import { createSummaryJob, getSummaryStatus } from '../services/summary.service';
import { summaryQueue } from '../services/queue.service';
import { AuthenticatedRequest } from '../types/custom-types';


export const uploadFileController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user?.id; // Assuming you have authentication middleware
   
    const file : any = await uploadFile(req.file, userId);
    console.log(file)
    
    // Create summary job
    const summary = await createSummaryJob(file._id.toString(), userId);
    console.log(summary,"djkgdsijhdsfieuo")

    // Add to processing queue
    await summaryQueue.add('processSummary', {
      fileId: file._id.toString(),
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      fileId: file._id,
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

    if (status.status === 'not_found') {
      return res.status(404).json({ error: 'File or summary not found' });
    }

    res.json(status);
  } catch (error) {
    console.error('Check summary status error:', error);
    res.status(500).json({ error: 'Failed to check summary status' });
  }
};