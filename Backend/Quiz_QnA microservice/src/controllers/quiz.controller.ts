import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { quizValidationSchema } from '../utils/validation';
import quizService from '../services/quiz.service';

class QuizController {
  async generateQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { educationLevel, topic } = quizValidationSchema.parse(req.body);
      
      const quiz = await quizService.generateQuiz(educationLevel, topic);
      
      res.status(StatusCodes.CREATED).json({
        success: true,
        data: quiz,
        message: 'Quiz generated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async submitQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      const { quizId, answers } = req.body;
      
      if (!quizId || !answers) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Quiz ID and answers are required'
        });
      }
      
      const result = await quizService.evaluateQuiz(quizId, answers);
      
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
}

export default new QuizController();