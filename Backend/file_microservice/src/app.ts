import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import fileRoutes from './routes/file.routes';
import summaryRoutes from './routes/summary.routes';
import { setupFileCleanupJob } from './utils/fileCleanup';
import connectDB from './config/database';
import { errorHandler, notFound } from './middlewares/error.middleware';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

// Setup file cleanup job
setupFileCleanupJob();

// Routes
app.use('/api/files', fileRoutes);
app.use('/api/summaries', summaryRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;