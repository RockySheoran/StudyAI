/**
 * Simple validation utilities
 * Helper functions for common validation tasks
 */

/**
 * Validates if a string is a valid MongoDB ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validates and sanitizes fileId parameter
 */
export const validateFileId = (fileId: any): { isValid: boolean; error?: string } => {
  if (!fileId || fileId === 'undefined' || fileId === 'null') {
    return { isValid: false, error: 'File ID is required' };
  }

  if (typeof fileId !== 'string') {
    return { isValid: false, error: 'File ID must be a string' };
  }

  if (!isValidObjectId(fileId)) {
    return { isValid: false, error: 'File ID must be a valid MongoDB ObjectId' };
  }

  return { isValid: true };
};

/**
 * Validates pagination parameters
 */
export const validatePagination = (page?: string, limit?: string) => {
  const pageNum = parseInt(page || '1');
  const limitNum = parseInt(limit || '10');
  
  return {
    page: isNaN(pageNum) || pageNum < 1 ? 1 : pageNum,
    limit: isNaN(limitNum) || limitNum < 1 ? 10 : Math.min(limitNum, 50)
  };
};

/**
 * Validates required fields in request
 */
export const validateRequiredFields = (data: any, requiredFields: string[]) => {
  const missing = requiredFields.filter(field => !data[field]);
  
  return {
    isValid: missing.length === 0,
    missingFields: missing
  };
};

/**
 * Sanitizes string input
 */
export const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};