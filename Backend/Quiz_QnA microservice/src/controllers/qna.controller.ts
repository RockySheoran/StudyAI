// backend/src/controllers/qna.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { qnaValidationSchema } from '../utils/validation';
import qnaService from '../services/qna.service';
import { AuthenticatedRequest } from '../utils/custom-types';

class QnAController {
  async generateQnA(req: AuthenticatedRequest , res: Response, next: NextFunction) {
    try {
      const { educationLevel, topic, marks } = qnaValidationSchema.parse(req.body);
      const {id} = req.user;

      const qna = await qnaService.generateQnA(educationLevel, topic, marks, id);

      res.status(StatusCodes.CREATED).json({
        success: true,
        data: qna,
        message: 'QnA generated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async submitQnA(req: Request, res: Response, next: NextFunction) {
    try {
      const { qnaId, answers } = req.body;
      
      if (!qnaId || !answers) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'QnA ID and answers are required'
        });
      }
      
      const result = await qnaService.evaluateQnA(qnaId, answers);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
        message: 'QnA evaluated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getQnA(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const qna = await qnaService.getQnAById(id);
      
      if (!qna) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'QnA not found'
        });
      }
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: qna,
        message: 'QnA retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getQnAHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.user;
      
      const qnaHistory = await qnaService.getQnAHistory(id);
      
      if (!qnaHistory) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: 'QnA history not found'
        });
      }
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: qnaHistory,
        message: 'QnA history retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new QnAController();