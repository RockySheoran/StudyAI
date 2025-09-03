import { Response } from 'express';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import { Resume } from '../models/resume.model';
import { AuthenticatedRequest } from '../types/custom-types';

export class ResumeController {
  async uploadResume(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const file = req.file;

      console.log('Resume upload attempt:', {
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
          message: 'Please select a valid PDF, DOC, or DOCX file'
        });
      }

      if (!file.buffer || file.buffer.length === 0) {
        return res.status(400).json({ 
          error: 'File buffer not available or empty',
          message: 'The uploaded file appears to be corrupted or empty. Please try uploading again.'
        });
      }

      // Additional validation for mobile uploads
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ 
          error: 'File too large',
          message: 'File size must be less than 10MB'
        });
      }

      // Upload buffer directly to Cloudinary (no local file system needed)
      const result = await uploadToCloudinary(file.buffer, userId || '');
      
      // Extract public ID from Cloudinary URL for deletion purposes
      const urlParts = result.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = `resumes/${userId}/${publicIdWithExtension.split('.')[0]}`;

      // Delete previous resumes for this user
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