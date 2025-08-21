import { Router } from 'express';
import quizController from '../controllers/quiz.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { quizValidationSchema } from '../utils/validation';


const router = Router();

router.post('/generate', validateRequest(quizValidationSchema), quizController.generateQuiz);
router.post('/submit', quizController.submitQuiz);
router.get('/:id', quizController.getQuiz);

export default router;