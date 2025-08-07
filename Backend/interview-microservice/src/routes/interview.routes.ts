import { Router } from 'express';
import { startInterview, continueInterview, getInterviewHistory,fetchInterview } from '../controllers/interview.controller';
import { middleware } from '../Middlewares/auth.middleware';
const router = Router();

router.post('/start', startInterview);
    router.get("/:id",fetchInterview)
router.post('/continue', continueInterview);
router.get('/history', getInterviewHistory);

export default router;