import { Router , Request , Response } from 'express';
import quizController from '../controllers/quiz.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { quizValidationSchema } from '../utils/validation';
import { middleware } from '../middleware/auth.middleware';


const router = Router();

router.post('/generate',middleware, validateRequest(quizValidationSchema), quizController.generateQuiz);
router.post('/submit', middleware, quizController.submitQuiz);
router.get('/:id', middleware, quizController.getQuiz);
router.get('/history', middleware, quizController.getQuizHistory);
router.get('/check', middleware, (req : Request, res : Response) => {
  res.send('List of all quizzes');
});


export default router;