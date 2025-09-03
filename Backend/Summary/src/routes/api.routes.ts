import { Router, Request, Response } from 'express';
import { uploadFileController, checkSummaryStatus } from '../controllers/file.controller';
import { getSummaryController, getSummaryHistory, deleteSummary } from '../controllers/summary.controller';
import multer from 'multer';
import { middleware } from '../Middlewares/auth.middleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize:5 * 1024 * 1024, // Increased to 10MB for mobile compatibility
    fieldSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    console.log('Summary service - File received:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // More flexible MIME type checking for mobile compatibility
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream', // Google Drive sometimes sends this
      'text/plain' // Fallback for some mobile browsers
    ];
    
    const allowedExtensions = ['.pdf', '.docx'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      console.log('Summary service - File rejected:', file.mimetype, fileExtension);
      cb(new Error(`Invalid file type. Allowed: PDF, DOCX. Received: ${file.mimetype}`));
    }
  }
});

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

// File routes
router.post('/upload', upload.single('file'), handleMulterError, middleware, uploadFileController);
router.get('/file/:fileId/status', checkSummaryStatus);

// Summary routes
router.get('/summary/:summaryId', getSummaryController);
router.get("/summary-history", middleware, getSummaryHistory);
router.delete("/summary/:summaryId", middleware, deleteSummary);

router.get('/check', (req : Request, res : Response) => {
  res.send('Summary service running with memory storage');
});

export default router;