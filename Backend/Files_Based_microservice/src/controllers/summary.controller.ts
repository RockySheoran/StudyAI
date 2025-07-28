import { Request, Response, NextFunction } from 'express';
import SummaryService from '../services/summary.service';
import { errorHandler } from '../utils/error-handler';

class SummaryController {
  async createSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await SummaryService.createSummary(req.params.fileId);
      res.status(201).json({
        success: true,
        data: summary
      });
    } catch (error) {
      errorHandler(error as Error, req, res , next);
    }
  }

  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await SummaryService.getSummaryById(req.params.id);
      if (!summary) {
        return res.status(404).json({
          success: false,
          message: 'Summary not found'
        });
      }

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      errorHandler(error as Error, req, res , next);
    }
  }

  async getSummaries(req: Request, res: Response, next: NextFunction) {
    try {
      const summaries = await SummaryService.getSummaries();
      res.status(200).json({
        success: true,
        data: summaries
      });
    } catch (error) {
      errorHandler(error as Error, req, res , next);
    }
  }

  async deleteSummary(req: Request, res: Response, next: NextFunction) {
    try {
      await SummaryService.deleteSummary(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Summary deleted successfully'
      });
    } catch (error) {
      errorHandler(error as Error, req, res , next);
    }
  }
}

export default new SummaryController();