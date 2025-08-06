import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { IInterview, IInterviewMessage } from '../models/interview.model';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const interviewSystemPrompts = {
  personal: `You are a professional HR interviewer conducting a personal interview. 
  Your goal is to assess the candidate's personality, communication skills, and cultural fit. 
  Ask relevant questions based on their resume and previous answers. 
  Be professional but friendly. After 8-10 questions, provide constructive feedback including a rating (1-5), 
  strengths, and areas for improvement.`,
  
  technical: `You are a technical interviewer assessing a candidate's skills based on their resume. 
  Ask progressively challenging questions about their mentioned technologies and projects. 
  Include some cross-questions to verify depth of knowledge. After 8-10 questions, 
  provide detailed feedback including a rating (1-5), technical strengths, and areas needing improvement.`
};

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-pro" });

  async generateInterviewResponse(
    interviewType: 'personal' | 'technical',
    conversationHistory: IInterviewMessage[],
    resumeText: string
  ): Promise<{ response: string; feedback?: any }> {
    try {
      const chat = this.model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: interviewSystemPrompts[interviewType] }],
          },
          {
            role: "user",
            parts: [{ text: `Here is the candidate's resume: ${resumeText}` }],
          },
          ...conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' as const : 'model' as const,
            parts: [{ text: msg.content }],
          })),
        ],
      });

      const result = await chat.sendMessage(conversationHistory[conversationHistory.length - 1].content);
      const response = await result.response;
      const text = response.text();

      // Check if the response contains feedback (end of interview)
      if (text.includes('Rating:') || text.includes('Feedback:')) {
        const feedback = this.parseFeedback(text);
        return { response: text, feedback };
      }

      return { response: text };
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      throw new Error('Failed to generate interview response');
    }
  }

  private parseFeedback(text: string) {
    const ratingMatch = text.match(/Rating:\s*(\d)/);
    const strengthsMatch = text.match(/Strengths:\s*([\s\S]*?)(?=Areas for Improvement|Suggestions:|$)/);
    const improvementsMatch = text.match(/(Areas for Improvement|Suggestions):\s*([\s\S]*?)(?=$)/);

    return {
      rating: ratingMatch ? parseInt(ratingMatch[1]) : 3,
      strengths: strengthsMatch 
        ? strengthsMatch[1].split('\n').filter(line => line.trim()).map(line => line.replace(/^- /, '').trim())
        : [],
      suggestions: improvementsMatch 
        ? improvementsMatch[2].split('\n').filter(line => line.trim()).map(line => line.replace(/^- /, '').trim())
        : [],
    };
  }
}