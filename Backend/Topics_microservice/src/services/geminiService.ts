import { GoogleGenerativeAI } from '@google/generative-ai';
import { TopicRequest } from '../types';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async getTopicDefinition(request: TopicRequest): Promise<string> {
    try {
      const prompt = this.buildPrompt(request.topic, request.detailLevel);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to generate topic definition');
    }
  }

  private buildPrompt(topic: string, detailLevel: string): string {
    let detailInstruction: string;
    
    switch(detailLevel) {
      case 'less':
        detailInstruction = 'Provide a concise definition in 1-2 sentences.';
        break;
      case 'more':
        detailInstruction = 'Provide a detailed explanation in a short paragraph (3-5 sentences).';
        break;
      case 'most':
        detailInstruction = 'Provide a comprehensive explanation in a long paragraph (6-10 sentences) with key details and context.';
        break;
      default:
        detailInstruction = 'Provide a detailed explanation in a paragraph.';
    }

    return `As an educational assistant, ${detailInstruction} Explain the topic: ${topic}. 
            Ensure the information is accurate, up-to-date, and appropriate for educational purposes.`;
  }
}