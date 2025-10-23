import { Router, Request, Response } from 'express';
import { uploadFileController, checkSummaryStatus } from '../controllers/file.controller';
import { getSummaryController, getSummaryHistory, deleteSummary } from '../controllers/summary.controller';
import multer from 'multer';
import { middleware } from '../Middlewares/auth.middleware';
import { validateFileId, validateParams } from '../utils/param-validation.middleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB for Google Drive compatibility
    fieldSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    console.log('Summary service - File received:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // Enhanced validation for Google Drive files
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream', // Google Drive files
      'text/plain', // Fallback for some mobile browsers
      'application/x-pdf', // Alternative PDF MIME type
      'application/msword' // DOC files
    ];
    
    const allowedExtensions = ['.pdf', '.docx', '.doc'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    // Priority check: extension first (more reliable for Google Drive), then MIME type
    const isValidExtension = allowedExtensions.includes(fileExtension);
    const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
    
    if (isValidExtension || isValidMimeType) {
      console.log('Summary service - File accepted:', { extension: fileExtension, mimetype: file.mimetype });
      cb(null, true);
    } else {
      console.log('Summary service - File rejected:', { 
        extension: fileExtension, 
        mimetype: file.mimetype,
        allowedExtensions,
        allowedMimeTypes 
      });
      cb(new Error(`Invalid file type. Allowed: PDF, DOCX, DOC. Received: ${file.mimetype} with extension ${fileExtension}`));
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  console.error('Multer error occurred:', {
    error: err,
    code: err.code,
    message: err.message,
    stack: err.stack
  });
  
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
    if (err.code === 'LIMIT_FIELD_VALUE') {
      return res.status(400).json({
        error: 'Field value too large',
        message: 'Request field value is too large',
        code: 'FIELD_TOO_LARGE'
      });
    }
  }
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: err.message,
      code: 'INVALID_FILE_TYPE'
    });
  }
  
  // Log unexpected errors
  console.error('Unexpected multer error:', err);
  return res.status(500).json({
    error: 'File processing error',
    message: 'An error occurred while processing your file',
    code: 'PROCESSING_ERROR'
  });
};

// File routes - middleware order is important
router.post('/upload', middleware, upload.single('file'), handleMulterError, uploadFileController);
router.get('/file/:fileId/status', validateFileId, checkSummaryStatus);

// Summary routes
router.get('/summary/:summaryId', validateParams(['summaryId']), getSummaryController);
router.get("/summary-history", middleware, getSummaryHistory);
router.delete("/summary/:summaryId", middleware, validateParams(['summaryId']), deleteSummary);

router.get('/check', (req : Request, res : Response) => {
  res.send('Summary service running with memory storage');
});

export default router;