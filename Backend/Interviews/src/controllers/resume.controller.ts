import { Response } from 'express';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import { Resume } from '../models/resume.model';
import { AuthenticatedRequest } from '../types/custom-types';

export class ResumeController {
  /**
   * Handles resume upload for interview personalization
   * Validates file format, uploads to cloud storage, and stores metadata
   */
  async uploadResume(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const file = req.file;

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

      // Validate file size for optimal processing
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ 
          error: 'File too large',
          message: 'File size must be less than 10MB'
        });
      }

      // Validate file extension for supported resume formats
      const allowedExtensions = ['.pdf', '.doc', '.docx'];
      const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
      
      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({ 
          error: 'Invalid file type',
          message: `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`
        });
      }

      // Upload resume to cloud storage
      const result = await uploadToCloudinary(file.buffer, userId || '');
      console.log("2222",result)
      
      // Generate public ID for future file management
      const urlParts = result.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = `resumes/${userId}/${publicIdWithExtension.split('.')[0]}`;

      // Replace any existing resume for this user
      await Resume.deleteMany({ userId: userId });

      const resume = new Resume({
        userId: userId || '',
        url: result,
        publicId,
        originalName: file.originalname,
      });

      await resume.save();
      console.log(resume)

     return res.status(201).json(resume);
    } catch (error) {
      console.error('Error uploading resume:', error);
      res.status(500).json({ error: 'Failed to upload resume' });
    }
  }

  /**
   * Deletes user's resume from both database and cloud storage
   * Ensures complete cleanup of resume data
   */
  async deleteResume(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const resume = await Resume.findOne({ userId: userId || '' });

      if (!resume) {
        return res.status(404).json({ error: 'No resume found' });
      }

      // Remove from cloud storage
      await deleteFromCloudinary(resume.publicId);
      
      // Remove from database
      await Resume.deleteOne({ _id: resume._id, userId: userId || '' });

      res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
      console.error('Error deleting resume:', error);
      res.status(500).json({ error: 'Failed to delete resume' });
    }
  }

  /**
   * Retrieves user's current resume information
   * Returns resume metadata including download URL
   */
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