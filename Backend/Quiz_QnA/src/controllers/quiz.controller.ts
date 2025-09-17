import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { quizValidationSchema } from '../utils/validation';
import quizService from '../services/quiz.service';
import { AuthenticatedRequest } from '../utils/custom-types';

class QuizController {
  async generateQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { educationLevel, topic, numberOfQuestions } = quizValidationSchema.parse(req.body);
      const { id } = req.user;

      const quiz = await quizService.generateQuiz(educationLevel, topic, numberOfQuestions, id);

      res.status(StatusCodes.CREATED).json({
        success: true,
        data: quiz,
        message: 'Quiz generated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async submitQuiz(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { quizId, answers } = req.body;
      
      if (!quizId || !answers) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Quiz ID and answers are required'
        });
      }
      
      const result = await quizService.evaluateQuiz(quizId, answers);
      console.log(result)
      const quiz = await quizService.getQuizById(quizId);
      quiz.result = result;
      await quiz.save();
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
        message: 'Quiz evaluated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const quiz = await quizService.getQuizById(id);
      
      if (!quiz) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Quiz not found'
        });
      }
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: quiz,
        message: 'Quiz retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuizHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.user;
      
      const quizHistory = await quizService.getQuizHistory(id);
      console.log(quizHistory)
      
      if (!quizHistory) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'Quiz history not found'
        });
      }
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: quizHistory,
        message: 'Quiz history retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new QuizController();