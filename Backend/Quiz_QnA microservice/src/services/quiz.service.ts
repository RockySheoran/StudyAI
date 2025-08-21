// backend/src/services/quiz.service.ts
import Quiz, { IQuiz } from '../models/quiz.model';
import geminiService from './gemini.service';
import { shuffleArray } from '../utils/helpers';

class QuizService {
  async generateQuiz(educationLevel: string, topic: string): Promise<IQuiz> {
    try {
      // Generate questions using Gemini AI
      const questions = await geminiService.generateQuizQuestions(educationLevel, topic);
      
      // Shuffle options for each question
      const processedQuestions = questions.map((question: any) => ({
        ...question,
        options: shuffleArray(question.options),
      }));
      
      // Save to database
      const quiz = new Quiz({
        educationLevel,
        topic,
        questions: processedQuestions,
      });
      
      return await quiz.save();
    } catch (error) {
      console.error('Error in generateQuiz:', error);
      throw new Error('Failed to generate quiz');
    }
  }

  async evaluateQuiz(quizId: string, userAnswers: string[]): Promise<any> {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }
      
      let score = 0;
      const results = quiz.questions.map((question, index) => {
        const isCorrect = userAnswers[index] === question.correctAnswer;
        if (isCorrect) score++;
        
        return {
          question: question.question,
          userAnswer: userAnswers[index],
          correctAnswer: question.correctAnswer,
          isCorrect,
          difficulty: question.difficulty,
        };
      });
      
      return {
        score,
        totalQuestions: quiz.questions.length,
        percentage: Math.round((score / quiz.questions.length) * 100),
        results,
      };
    } catch (error) {
      console.error('Error in evaluateQuiz:', error);
      throw new Error('Failed to evaluate quiz');
    }
  }

  async getQuizById(id: string): Promise<IQuiz | null> {
    try {
      return await Quiz.findById(id);
    } catch (error) {
      console.error('Error in getQuizById:', error);
      throw new Error('Failed to fetch quiz');
    }
  }
}

export default new QuizService();