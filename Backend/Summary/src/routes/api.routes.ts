import { Router, Request, Response } from 'express';
import { uploadFileController, checkSummaryStatus } from '../controllers/file.controller';
import { getSummaryController, getSummaryHistory, deleteSummary } from '../controllers/summary.controller';
import multer from 'multer';
import path from 'path';
import { middleware } from '../Middlewares/auth.middleware';

const router = Router();
const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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