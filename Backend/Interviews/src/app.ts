import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import interviewRoutes from './routes/interview.routes';
import resumeRoutes from './routes/resume.routes';
import { connectRedis } from './config/redis';
import { startCleanupJob } from './utils/cleanup.utils';


dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}))
app.use(express.json());
app.use(morgan('dev'));
connectRedis()
startCleanupJob()

// Routes
app.use('/api/interview', interviewRoutes);
app.use('/api/resume', resumeRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Interview API!');
})


export default app;