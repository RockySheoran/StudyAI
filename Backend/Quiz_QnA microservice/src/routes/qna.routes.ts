// backend/src/routes/qna.routes.ts
import { Router } from 'express';
import qnaController from '../controllers/qna.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { qnaValidationSchema } from '../utils/validation';
// Make sure the path is correct and the file exists; update as needed:

const router = Router();

router.post('/generate', validateRequest(qnaValidationSchema), qnaController.generateQnA);
router.post('/submit', qnaController.submitQnA);
router.get('/:id', qnaController.getQnA);

export default router;