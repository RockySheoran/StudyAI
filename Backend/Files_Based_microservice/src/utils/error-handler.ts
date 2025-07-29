import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import logger from './logger';

// Error handler middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Error: ${err.message}`);
  
  if (err instanceof createHttpError.HttpError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        status: err.statusCode,
      },
    });
  }

  // Default to 500 server error
  return res.status(500).json({
    error: {
      message: 'Internal Server Error',
      status: 500,
    },
  });
};

// 404 Not Found handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(createHttpError(404, 'Resource not found'));
};