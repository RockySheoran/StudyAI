import { Router } from 'express';
import { generatePdfSummary, getPdfSummary } from '../controllers/summary.controller';

const router = Router();

router.post('/:id', generatePdfSummary);
router.get('/:id', getPdfSummary);
// router.get('/job/:id', getJobStatus);

export default router;