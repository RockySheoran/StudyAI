import express from 'express';
import { getHistory } from '../controllers/history';
import { middleware } from '../middleware/auth_middleware';

const router = express.Router();

router.get('/', middleware ,  getHistory);

export default router;