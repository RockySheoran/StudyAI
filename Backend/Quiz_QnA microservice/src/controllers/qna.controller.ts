// backend/src/controllers/qna.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { qnaValidationSchema } from '../utils/validation';
import qnaService from '../services/qna.service';

class QnAController {
  async generateQnA(req: Request, res: Response, next: NextFunction) {
    try {
      const { educationLevel, topic, marks } = qnaValidationSchema.parse(req.body);
      
      const qna = await qnaService.generateQnA(educationLevel, topic, marks);
      
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
}

export default new QnAController();