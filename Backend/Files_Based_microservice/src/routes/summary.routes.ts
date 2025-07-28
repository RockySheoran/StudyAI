import { Router } from 'express';
import SummaryController from '../controllers/summary.controller';

const router = Router();

router.post('/:fileId', SummaryController.createSummary);
router.get('/', SummaryController.getSummaries);
router.get('/:id', SummaryController.getSummary);
router.delete('/:id', SummaryController.deleteSummary);

export default router;