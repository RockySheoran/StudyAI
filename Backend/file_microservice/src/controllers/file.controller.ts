import { Request, Response } from 'express';
import { deleteFromCloudinary, uploadToCloudinary } from '../services/storage.service';
import { saveFileMetadata, getUserFiles as getFiles } from '../services/file.service';
import { getPDFInfo } from '../utils/pdfProcessor';
import { IUserRequest } from '../types/customTypes'; // Assuming you have a custom type for authenticated requests

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    if (!req.file.mimetype.includes('pdf')) {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    // Process PDF
    let pdfInfo;
    try {
      pdfInfo = await getPDFInfo(req.file.buffer);
    } catch (error) {
      console.error('Error processing PDF:', error);
      return res.status(400).json({ error: 'Invalid PDF file' });
    }

    // Upload to Cloudinary
    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: 'pdf-summaries',
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return res.status(500).json({ error: 'Failed to upload file to cloud storage' });
    }

    // Calculate delete date (4 days from now)
    const deleteDate = new Date();
    deleteDate.setDate(deleteDate.getDate() + 4);

    // Save file metadata
    try {
      const file = await saveFileMetadata({
        originalName: req.file.originalname,
        cloudinaryUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        deleteDate,
        pages: pdfInfo.numPages,
        size: pdfInfo.size,
        userId: (req as IUserRequest).user?.id, // Type assertion for authenticated request
      } as any);

      return res.status(201).json({
        message: 'File uploaded successfully',
        fileId: file._id,
        url: uploadResult.secure_url,
        pages: file.pages,
        size: file.size,
      });
    } catch (error) {
      console.error('Database save error:', error);
      // Attempt to delete from Cloudinary if save failed
      if (uploadResult?.public_id) {
        try {
          await deleteFromCloudinary(uploadResult.public_id);
        } catch (cleanupError) {
          console.error('Failed to cleanup Cloudinary file:', cleanupError);
        }
      }
      return res.status(500).json({ error: 'Failed to save file metadata' });
    }
  } catch (error) {
    console.error('Unexpected error in uploadFile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserFiles = async (req: Request, res: Response) => {
  try {
    const userId = (req as IUserRequest).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const files = await getFiles(userId); // Using the renamed import
    return res.json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error) {
    console.error('Error in getUserFiles:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch files',
      details: process.env.NODE_ENV === 'development' ? "error in  getting files":"anyy"
    });
  }
};