import { Router } from 'express';
import {
  generateFileSummary,
  getSummaryHistory,
} from '../controllers/summary.controller';
import { protect } from '../middlewares/auth.middleware'; // Assuming you have auth middleware

const router = Router();

router.post('/:fileId/summary',  generateFileSummary);
router.get('/history',  getSummaryHistory);

export default router;