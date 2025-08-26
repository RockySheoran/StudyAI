import express from 'express';
import { getCurrentAffairs } from '../controllers/currentAffairs';
import { middleware } from '../middleware/auth_middleware';

const router = express.Router();

// Make sure the import is correct and the function exists
router.get('/', middleware ,getCurrentAffairs);

export default router;