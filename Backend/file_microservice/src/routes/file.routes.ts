import { Router } from 'express';
import { uploadFile, getUserFiles } from '../controllers/file.controller';
import multer from 'multer';
import { protect } from '../middlewares/auth.middleware'; // Assuming you have auth middleware

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/upload', upload.single('file'), uploadFile);
router.get('/user-files', getUserFiles);

export default router;