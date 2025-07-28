import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import fileRoutes from './routes/file.routes';
import summaryRoutes from './routes/summary.routes';
import { errorHandler } from './utils/error-handler';
import { config } from './config';

const app = express();
// In your app.ts, ensure you don't have anything like this:
app.use((req, res, next) => {
  // This would suppress all console logs
  console.log = function() {};
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(config.mongodbUri)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));
// Routes
app.use('/api/files', fileRoutes);
app.use('/api/summaries', summaryRoutes);

// Error handler
app.use(errorHandler);

export default app;