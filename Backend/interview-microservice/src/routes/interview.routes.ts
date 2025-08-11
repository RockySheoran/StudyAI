import { Router } from 'express';
import { startInterview, continueInterview, getInterviewHistory, fetchInterview } from '../controllers/interview.controller';
import { middleware } from '../Middlewares/auth.middleware';

const router = Router();

router.get('/history', middleware, getInterviewHistory);
router.post('/start', middleware, startInterview);
router.get("/:id", middleware, fetchInterview);
router.post('/continue', middleware, continueInterview);
router.get('/check', middleware, (req, res) => {
  res.send('List of all interviews');
});


export default router;