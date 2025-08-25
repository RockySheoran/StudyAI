import express from 'express';
import { getHistory } from '../controllers/history';

const router = express.Router();

router.get('/', getHistory);

export default router;