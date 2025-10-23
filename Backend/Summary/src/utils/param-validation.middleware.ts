import { Request, Response, NextFunction } from 'express';
import { sendValidationError } from './response';
import { validateFileId as validateFileIdUtil } from './validation';

/**
 * Middleware to validate fileId parameter
 */
export const validateFileId = (req: Request, res: Response, next: NextFunction) => {
  const { fileId } = req.params;
  
  console.log('Validating fileId parameter:', fileId);
  
  // Check if fileId is undefined, null, or empty
  if (!fileId || fileId === 'undefined' || fileId === 'null' || fileId.trim() === '') {
    console.error('Invalid fileId received:', fileId);
    return sendValidationError(res, ['File ID is missing or invalid'], 'A valid file ID is required');
  }
  
  // Validate fileId format
  const validation = validateFileIdUtil(fileId);
  if (!validation.isValid) {
    console.error('FileId validation failed:', validation.error);
    return sendValidationError(res, [validation.error!], 'Valid file ID is required');
  }
  
  next();
};

/**
 * Generic middleware to validate multiple parameters
 */
export const validateParams = (paramNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];
    
    for (const paramName of paramNames) {
      const paramValue = req.params[paramName];
      
      if (!paramValue || paramValue === 'undefined' || paramValue === 'null' || paramValue.trim() === '') {
        errors.push(`${paramName} is required`);
        continue;
      }
      
      // Validate ObjectId format for ID parameters
      if (paramName.includes('Id') || paramName.includes('ID')) {
        const validation = validateFileIdUtil(paramValue);
        if (!validation.isValid) {
          errors.push(`${paramName} must be a valid ID`);
        }
      }
    }
    
    if (errors.length > 0) {
      return sendValidationError(res, errors, 'Parameter validation failed');
    }
    
    next();
  };
};