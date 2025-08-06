import { Router } from 'express';
import { ResumeController } from '../controllers/resume.controller';
import { middleware } from '../Middlewares/auth.middleware';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = Router();
const resumeController = new ResumeController(); // Make sure to instantiate the controller

// Correct routes with proper controller methods
router.post('/upload', upload.single('resume'), resumeController.uploadResume.bind(resumeController));
router.delete('/', resumeController.deleteResume.bind(resumeController));
router.get('/', resumeController.getResume.bind(resumeController));

export default router;