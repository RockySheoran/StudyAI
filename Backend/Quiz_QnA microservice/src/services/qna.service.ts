// backend/src/services/qna.service.ts
import QnA, { IQnA } from '../models/qna.model';
import geminiService from './gemini.service';

class QnAService {
  async generateQnA(educationLevel: string, topic: string, marks: number): Promise<IQnA> {
    try {
      // In a real implementation, you would use Gemini to generate QnA questions
      // For now, we'll create some sample questions
      const sampleQuestions = [
        { question: `Explain the main concepts of ${topic} in detail.`, maxMarks: marks },
        { question: `How does ${topic} relate to real-world applications?`, maxMarks: marks },
        { question: `Compare and contrast different approaches to ${topic}.`, maxMarks: marks },
        { question: `What are the challenges associated with ${topic}?`, maxMarks: marks },
        { question: `Describe the historical development of ${topic}.`, maxMarks: marks },
      ];
      
      // Save to database
      const qna = new QnA({
        educationLevel,
        topic,
        questions: sampleQuestions,
      });
      
      return await qna.save();
    } catch (error) {
      console.error('Error in generateQnA:', error);
      throw new Error('Failed to generate QnA');
    }
  }

  async evaluateQnA(qnaId: string, userAnswers: string[]): Promise<any> {
    try {
      const qna = await QnA.findById(qnaId);
      if (!qna) {
        throw new Error('QnA not found');
      }
      
      // Use Gemini to evaluate answers
      const questions = qna.questions.map(q => q.question);
      const evaluation = await geminiService.evaluateQnAAnswers(questions, userAnswers);
      
      return evaluation;
    } catch (error) {
      console.error('Error in evaluateQnA:', error);
      throw new Error('Failed to evaluate QnA answers');
    }
  }

  async getQnAById(id: string): Promise<IQnA | null> {
    try {
      return await QnA.findById(id);
    } catch (error) {
      console.error('Error in getQnAById:', error);
      throw new Error('Failed to fetch QnA');
    }
  }
}

export default new QnAService();