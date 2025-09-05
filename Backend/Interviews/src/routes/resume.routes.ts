import { Router } from 'express';
import { ResumeController } from '../controllers/resume.controller';
import { middleware } from '../Middlewares/auth.middleware';
import multer from 'multer';

// Use memory storage for serverless environments (Vercel)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for Google Drive compatibility
    fieldSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    console.log('Resume upload - File received:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // Enhanced validation for Google Drive files
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream', // Google Drive files
      'text/plain', // Fallback for some mobile browsers
      'application/x-pdf', // Alternative PDF MIME type
      'application/vnd.ms-word' // Alternative DOC MIME type
    ];
    
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    // Priority check: extension first (more reliable for Google Drive), then MIME type
    const isValidExtension = allowedExtensions.includes(fileExtension);
    const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
    
    if (isValidExtension || isValidMimeType) {
      console.log('Resume upload - File accepted:', { extension: fileExtension, mimetype: file.mimetype });
      cb(null, true);
    } else {
      console.log('Resume upload - File rejected:', { 
        extension: fileExtension, 
        mimetype: file.mimetype,
        allowedExtensions,
        allowedMimeTypes 
      });
      cb(new Error(`Invalid file type. Allowed: PDF, DOC, DOCX. Received: ${file.mimetype} with extension ${fileExtension}`));
    }
  }
});
const router = Router();
const resumeController = new ResumeController(); // Make sure to instantiate the controller

// Error handling middleware for multer
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size must be less than 10MB',
        code: 'FILE_TOO_LARGE'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected file field',
        message: 'Please use the correct file field name',
        code: 'INVALID_FIELD'
      });
    }
  }
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: err.message,
      code: 'INVALID_FILE_TYPE'
    });
  }
  next(err);
};

// Correct routes with proper controller methods
router.post('/upload', upload.single('resume'), handleMulterError, middleware, resumeController.uploadResume.bind(resumeController));
router.delete('/', middleware,resumeController.deleteResume.bind(resumeController));
router.get('/', middleware,resumeController.getResume.bind(resumeController));

export default router;