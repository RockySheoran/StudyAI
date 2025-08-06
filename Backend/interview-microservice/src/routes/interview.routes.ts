import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller';
import { middleware     } from '../Middlewares/auth.middleware';

const router = Router();
const interviewController = new InterviewController();

router.post('/start', interviewController.startInterview);
router.post('/continue', interviewController.continueInterview);
router.get('/history', interviewController.getInterviewHistory);

export default router;