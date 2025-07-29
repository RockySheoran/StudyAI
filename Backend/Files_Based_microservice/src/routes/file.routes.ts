import { Router } from 'express';
import { uploadPdf, getFile, cleanupFiles } from '../controllers/file.controller';

const router = Router();

router.post('/', uploadPdf);
router.get('/:id', getFile);
router.delete('/cleanup', cleanupFiles); // Can be protected or called via cron

export default router;