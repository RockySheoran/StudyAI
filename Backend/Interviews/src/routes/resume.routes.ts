import { Router } from 'express';
import { ResumeController } from '../controllers/resume.controller';
import { middleware } from '../Middlewares/auth.middleware';
import multer from 'multer';

// Use memory storage for serverless environments (Vercel)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});
const router = Router();
const resumeController = new ResumeController(); // Make sure to instantiate the controller

// Correct routes with proper controller methods
router.post('/upload', upload.single('resume'), middleware,resumeController.uploadResume.bind(resumeController));
router.delete('/', middleware,resumeController.deleteResume.bind(resumeController));
router.get('/', middleware,resumeController.getResume.bind(resumeController));

export default router;