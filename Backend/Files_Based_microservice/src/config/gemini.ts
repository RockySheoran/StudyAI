import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

// Initialize Gemini API
console.log("Initializing Gemini API",process.env.GEMINI_API_KEY);
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Get the generative model
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    maxOutputTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
  }
});
export const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: "embedding-001",  // Default embedding model
});

export default model;