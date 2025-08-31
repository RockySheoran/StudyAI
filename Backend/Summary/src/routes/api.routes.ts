import { Router, Request, Response } from 'express';
import { uploadFileController, checkSummaryStatus } from '../controllers/file.controller';
import { getSummaryController, getSummaryHistory, deleteSummary } from '../controllers/summary.controller';
import multer from 'multer';
import path from 'path';
import { middleware } from '../Middlewares/auth.middleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only PDF and DOCX files
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// File routes
router.post('/upload', upload.single('file'),middleware, uploadFileController);
router.get('/file/:fileId/status', checkSummaryStatus);

// Summary routes
router.get('/summary/:summaryId', getSummaryController);
router.get("/summary-history", middleware, getSummaryHistory);
router.delete("/summary/:summaryId", middleware, deleteSummary);

router.get('/check', (req : Request, res : Response) => {
  res.send('List of all summaries');
});

export default router;