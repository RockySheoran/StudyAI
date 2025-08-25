import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import currentAffairsRoutes from './routes/currentAffairs';
import historyRoutes from './routes/history';

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/current-affairs', currentAffairsRoutes);
app.use('/api/history', historyRoutes);

export default app;