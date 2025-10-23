import { Response } from 'express';

/**
 * Standardized API response utilities
 * Provides consistent response format across the application
 */

export const sendSuccess = (res: Response, data: any, message?: string, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendError = (res: Response, error: string, message?: string, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error,
    message
  });
};

export const sendValidationError = (res: Response, errors: string[], message = 'Validation failed') => {
  return res.status(400).json({
    success: false,
    error: 'Validation Error',
    message,
    errors
  });
};

export const sendNotFound = (res: Response, resource = 'Resource', message?: string) => {
  return res.status(404).json({
    success: false,
    error: 'Not Found',
    message: message || `${resource} not found`
  });
};