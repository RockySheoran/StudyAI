import express from 'express';
import { getCurrentAffairs } from '../controllers/currentAffairs';

const router = express.Router();

// Make sure the import is correct and the function exists
router.get('/', getCurrentAffairs);

export default router;