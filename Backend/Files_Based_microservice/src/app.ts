import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { storage } from './config/cloudinary';
import multer from 'multer';

import connectDB from './config/database';
import logger from './utils/logger';

// Import routes
import fileRoutes from './routes/file.routes';
import summaryRoutes from './routes/summary.routes';
import { errorHandler, notFoundHandler } from './utils/error-handler';
import redisClient from './config/redis';

// Initialize express app
const app = express();

// Connect to database
connectDB();
redisClient; // Initialize Redis connection

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev', { stream: { write: (message :any) => logger.http(message.trim()) } }));

// Configure multer for file uploads
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Routes
app.use('/api/files', upload.single('file'), fileRoutes);
app.use('/api/summaries', summaryRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;