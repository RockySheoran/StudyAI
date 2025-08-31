import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import currentAffairsRoutes from './routes/currentAffairs';
import historyRoutes from './routes/history';
import { middleware } from './middleware/auth_middleware';

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Current Affairs API!');
})

app.use('/api/current-affairs' , currentAffairsRoutes);
app.use('/api/current-affairs/history', historyRoutes);

export default app;