import express from 'express';
import { getTopicDefinition, getSearchHistory } from '../controllers/topicController';
import { validateTopicRequest } from '../middleware/validation';
import { middleware } from '../middleware/auth_middleware';

const router = express.Router();

router.post('/definition', validateTopicRequest,middleware, getTopicDefinition);
router.get('/history', getSearchHistory);

export default router;