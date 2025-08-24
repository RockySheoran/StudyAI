import express from 'express';
import { getCurrentAffairs } from '../controllers/currentAffairs';
import { middleware } from '../middleware/auth_middleware';

const router = express.Router();

router.get('/' ,getCurrentAffairs);

export default router;