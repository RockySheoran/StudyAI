import { Response } from 'express';

export class ResponseHandler {
  static success(res: Response, data?: any, message?: string) {
    return res.status(200).json({
      success: true,
      message: message || 'Success',
      data
    });
  }

  static created(res: Response, data?: any, message?: string) {
    return res.status(201).json({
      success: true,
      message: message || 'Created successfully',
      data
    });
  }

  static badRequest(res: Response, message?: string) {
    return res.status(400).json({
      success: false,
      message: message || 'Bad request'
    });
  }

  static unauthorized(res: Response, message?: string) {
    return res.status(401).json({
      success: false,
      message: message || 'Unauthorized'
    });
  }

  static notFound(res: Response, message?: string) {
    return res.status(404).json({
      success: false,
      message: message || 'Not found'
    });
  }

  static conflict(res: Response, message?: string) {
    return res.status(409).json({
      success: false,
      message: message || 'Conflict'
    });
  }

  static error(res: Response, message?: string) {
    return res.status(500).json({
      success: false,
      message: message || 'Internal server error'
    });
  }
}