import { Router } from 'express';
import { ResumeController } from '../controllers/resume.controller';
import { middleware } from '../Middlewares/auth.middleware';
import multer from 'multer';

// Use memory storage for serverless environments (Vercel)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Increased to 10MB for mobile compatibility
  },
  fileFilter: (req, file, cb) => {
    console.log('File received:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // More flexible MIME type checking for mobile compatibility
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream', // Google Drive sometimes sends this
      'text/plain' // Fallback for some mobile browsers
    ];
    
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      console.log('File rejected:', file.mimetype, fileExtension);
      cb(new Error(`Invalid file type. Allowed: PDF, DOC, DOCX. Received: ${file.mimetype}`));
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
        message: 'File size must be less than 5MB',
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