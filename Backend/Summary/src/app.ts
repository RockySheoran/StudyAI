import dotenv from 'dotenv';
dotenv.config();  
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRoutes from './routes/api.routes';
import { connectDB } from './config/database';
import { configureCloudinary } from './config/cloudinary';
import { connectRedis } from './config/redis';
import { initializeSummaryWorker } from './jobs/summary.job';
import { startCleanupJob } from './utils/cleanup.utils';

export const createApp = () => {
  const app = express();

  // Middleware
 app.use(cors({
     origin: process.env.FRONTEND_URL || "http://localhost:3000",
     credentials: true,
     methods: ["GET", "POST", "PUT", "DELETE"],
     allowedHeaders: ["Content-Type", "Authorization"],
 }))
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Global error handler:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
      });
    }
  });

  // Routes
  app.use('/api', apiRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/', (req, res) => {
    res.send('Welcome to the Summary API!');
  })

  // Initialize services
  const initializeServices = async () => {
    await connectDB();
    configureCloudinary();
    await connectRedis();
    initializeSummaryWorker();
    startCleanupJob();
  };

  return { app, initializeServices };
};