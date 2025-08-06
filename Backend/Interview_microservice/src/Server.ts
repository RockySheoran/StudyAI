import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.query.userId}_${file.originalname}`);
  }
});

// const upload = multer({ storage });

const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/interview_app')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// MongoDB Schema
const interviewHistorySchema = new mongoose.Schema({
  userId: String,
  interviewType: String,
  resumeText: String,
  conversation: [{
    role: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const InterviewHistory = mongoose.model('InterviewHistory', interviewHistorySchema);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Interview prompts
const INTERVIEW_PROMPTS = {
  personal: `You are conducting a personal interview. Ask questions about the candidate's background, 
            motivations, strengths, weaknesses, and career aspirations. Be professional but friendly. 
            Ask one question at a time and wait for the response. Adapt your questions based on the candidate's answers.`,
  technical: `You are conducting a technical interview based on the candidate's resume. 
             Ask relevant technical questions about their skills, projects, and experience. 
             Start with easier questions and gradually increase difficulty based on their responses. 
             Ask one question at a time and provide feedback when appropriate.`
};

// Resume upload endpoint
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let resumeText = '';
    
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(dataBuffer);
      console.log(data)
      resumeText = data.text;
    } else if (req.file.mimetype.includes('word')) {
      // For DOC/DOCX files, you would need a library like mammoth
      // This is a simplified example
      resumeText = "Word document content extraction would go here";
    }

    // Store resume text in database associated with userId
    // You might want to create a separate collection for resumes

    fs.unlinkSync(req.file.path); // Clean up the uploaded file

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
});

// Start interview endpoint
app.post('/api/start-interview', async (req, res) => {
  try {
    const { userId, interviewType, hasResume } = req.body;

    if (!['personal', 'technical'].includes(interviewType)) {
      return res.status(400).json({ error: 'Invalid interview type' });
    }

    const history = new InterviewHistory({
      userId,
      interviewType,
      conversation: []
    });

    await history.save();

    // Generate first question
    let prompt = `${INTERVIEW_PROMPTS[interviewType as keyof typeof INTERVIEW_PROMPTS]}\n\n`;
    console.log(hasResume, interviewType, 'hasResume and interviewType'); 
    if (hasResume && interviewType === 'technical') {
      prompt += `The candidate has uploaded a resume. Start with a question about their most relevant technical skill or experience mentioned in their resume.`;
    } else {
      prompt += `Start the interview with an appropriate first question.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    history.conversation.push({
      role: 'ai',
      content: text
    });
    await history.save();

    res.json({
      interviewId: history._id,
      question: text
    });
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
});

// Process audio endpoint
app.post('/api/process-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    // In a real app, you would process the audio file with a speech-to-text API
    // For this example, we'll just return a mock transcript
    const mockTranscript = "This would be the transcribed text from the audio";

    fs.unlinkSync(req.file.path); // Clean up the audio file

    res.json({ transcript: mockTranscript });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ error: 'Failed to process audio' });
  }
});

// Continue interview endpoint
app.post('/api/continue-interview', async (req, res) => {
  try {
    const { interviewId, userResponse } = req.body;
    
    const history = await InterviewHistory.findById(interviewId);
    if (!history) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    history.conversation.push({
      role: 'user',
      content: userResponse
    });

    const interviewType = history.interviewType;
    const promptBase = (interviewType && INTERVIEW_PROMPTS[interviewType as keyof typeof INTERVIEW_PROMPTS]) || INTERVIEW_PROMPTS.personal;
    let prompt = `${promptBase}\n\n`;
    history.conversation.forEach(msg => {
      prompt += `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}\n`;
    });
    prompt += 'Interviewer: ';

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    history.conversation.push({
      role: 'ai',
      content: text
    });
    await history.save();

    res.json({
      question: text,
      conversation: history.conversation
    });
  } catch (error) {
    console.error('Error continuing interview:', error);
    res.status(500).json({ error: 'Failed to continue interview' });
  }
});

// Interview history endpoint
app.get('/api/interview-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const histories = await InterviewHistory.find({ userId }).sort({ createdAt: -1 });
    res.json(histories);
  } catch (error) {
    console.error('Error fetching interview history:', error);
    res.status(500).json({ error: 'Failed to fetch interview history' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});