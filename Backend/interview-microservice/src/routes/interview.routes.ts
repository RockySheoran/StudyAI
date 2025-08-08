import { Router } from 'express';
import { startInterview, continueInterview, getInterviewHistory,fetchInterview } from '../controllers/interview.controller';
import { middleware } from '../Middlewares/auth.middleware';
const router = Router();

router.post('/start', middleware, startInterview);
    router.get("/:id",middleware,fetchInterview)
router.post('/continue', middleware, continueInterview);
router.get('/history', middleware,getInterviewHistory);

export default router;