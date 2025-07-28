import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '.';

export const initGemini = () => {
  if (!config.geminiApiKey) {
    throw new Error('Gemini API key is not configured');
  }
  return new GoogleGenerativeAI(config.geminiApiKey);
};