import { Router } from 'express';
import FileController from '../controllers/file.controller';
import { upload } from '../controllers/file.controller';

const router = Router();

router.post('/', upload.single('file'), FileController.uploadFile);
router.get('/:id', FileController.getFile);
router.delete('/:id', FileController.deleteFile);

export default router;