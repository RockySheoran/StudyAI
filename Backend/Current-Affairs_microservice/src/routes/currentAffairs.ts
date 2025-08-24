import express from 'express';
import { getCurrentAffairs } from '../controllers/currentAffairs';

const router = express.Router();

router.get('/', getCurrentAffairs);

export default router;