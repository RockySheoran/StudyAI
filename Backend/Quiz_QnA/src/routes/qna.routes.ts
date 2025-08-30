// backend/src/routes/qna.routes.ts
import { Router , Request , Response } from 'express';
import qnaController from '../controllers/qna.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { qnaValidationSchema } from '../utils/validation';
import { middleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/generate',middleware, validateRequest(qnaValidationSchema), qnaController.generateQnA);
router.post('/submit', middleware, qnaController.submitQnA);
router.get('/history', middleware, qnaController.getQnAHistory);
router.get('/:id', middleware, qnaController.getQnA);
router.get('/check', middleware, (req : Request, res : Response) => {
  res.send('List of all qna');
});

export default router;