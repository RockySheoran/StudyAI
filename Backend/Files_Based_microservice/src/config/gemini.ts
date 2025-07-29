import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Get the generative model
const model = genAI.getGenerativeModel({ 
  model: "gemini-pro",
  generationConfig: {
    maxOutputTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
  }
});

export default model;