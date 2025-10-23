/**
 * Application constants
 * Centralized place for all constant values used across the application
 */

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.doc'],
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
    'text/plain',
    'application/x-pdf',
    'application/msword'
  ]
};

// Cache settings
export const CACHE_SETTINGS = {
  SUMMARY_COMPLETED_TTL: 3600, // 1 hour for completed summaries
  SUMMARY_PENDING_TTL: 60,     // 1 minute for pending summaries
  SUMMARY_FAILED_TTL: 300,     // 5 minutes for failed summaries
  HISTORY_TTL: 1800            // 30 minutes for history
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50
};

// Queue settings
export const QUEUE_SETTINGS = {
  MAX_ATTEMPTS: 5,
  BACKOFF_DELAY: 2000,
  KEEP_COMPLETED: 50,
  KEEP_FAILED: 100
};

// File cleanup settings
export const CLEANUP = {
  FILE_RETENTION_DAYS: 4,
  OLD_DATA_CLEANUP_DAYS: 30
};

// Response messages
export const MESSAGES = {
  FILE_UPLOAD_SUCCESS: 'File uploaded successfully',
  SUMMARY_DELETED: 'Summary deleted successfully',
  VALIDATION_ERROR: 'Validation failed',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'An internal server error occurred'
};