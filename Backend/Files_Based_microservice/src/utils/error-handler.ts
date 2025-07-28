import { Request, Response, NextFunction } from 'express';
import { Logger } from './logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  Logger.error(err.message, { stack: err.stack });

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};