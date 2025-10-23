import { Router   , Request , Response} from 'express';
import { startInterview, continueInterview, getInterviewHistory, fetchInterview, feedbackController, getCacheStatus } from '../controllers/interview.controller';
import { middleware } from '../Middlewares/auth.middleware';


const router = Router();

router.get('/history', middleware, getInterviewHistory);
router.post('/start', middleware, startInterview);
router.get("/:id", middleware, fetchInterview);
router.post('/continue', middleware, continueInterview);
router.get("/feedback/:id", middleware,feedbackController);
router.get('/cache-status/:resumeId', middleware, getCacheStatus);
router.get('/check', middleware, (req : Request, res : Response) => {
  res.send('List of all interviews');
});


export default router;