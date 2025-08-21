import express from 'express';
import { getTopicDefinition, getSearchHistory } from '../controllers/topicController';
import { validateTopicRequest } from '../middleware/validation';

const router = express.Router();

router.post('/definition', validateTopicRequest, getTopicDefinition);
router.get('/history', getSearchHistory);

export default router;