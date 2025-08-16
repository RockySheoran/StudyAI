import { Response } from 'express';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import { Resume } from '../models/resume.model';
import { AuthenticatedRequest } from '../types/custom-types';
import { unlink } from 'fs/promises';

export class ResumeController {
  async uploadResume(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }



      const result = await uploadToCloudinary(file.path, userId || '');
      const publicId = result.split('/').pop()?.split('.')[0] || '';

      await unlink(file.path);

      // Delete previous resumes
      await Resume.deleteMany({ userId: userId });

      const resume = new Resume({
        userId: userId || '',
        url: result,
        publicId,
      });

      await resume.save();

      res.status(201).json(resume);
    } catch (error) {
      console.error('Error uploading resume:', error);
      res.status(500).json({ error: 'Failed to upload resume' });
    }
  }

  async deleteResume(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const resume = await Resume.findOne({ userId: userId || '' });

      if (!resume) {
        return res.status(404).json({ error: 'No resume found' });
      }

      await deleteFromCloudinary(resume.publicId);
      await Resume.deleteOne({ _id: resume._id, userId: userId || '' });

      res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
      console.error('Error deleting resume:', error);
      res.status(500).json({ error: 'Failed to delete resume' });
    }
  }

  async getResume(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const resume = await Resume.findOne({ userId: userId || '' });

      if (!resume) {
        return res.status(404).json({ error: 'No resume found' });
      }

      res.status(200).json(resume);
    } catch (error) {
      console.error('Error fetching resume:', error);
      res.status(500).json({ error: 'Failed to fetch resume' });
    }
  }
}