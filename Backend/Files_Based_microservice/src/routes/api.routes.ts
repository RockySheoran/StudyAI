import { Router } from 'express';
import { uploadFileController, checkSummaryStatus } from '../controllers/file.controller';
import { getSummaryController } from '../controllers/summary.controller';
import multer from 'multer';
import path from 'path';

const router = Router();
const upload = multer({
  dest: path.join(__dirname, '../../temp/uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// File routes
router.post('/upload', upload.single('file'), uploadFileController);
router.get('/file/:fileId/status', checkSummaryStatus);

// Summary routes
router.get('/summary/:summaryId', getSummaryController);

export default router;