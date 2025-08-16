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
     origin: process.env.CLIENT_URL || "http://localhost:3000",
     credentials: true,
     methods: ["GET", "POST", "PUT", "DELETE"],
     allowedHeaders: ["Content-Type", "Authorization"],
 }))
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/api', apiRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

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