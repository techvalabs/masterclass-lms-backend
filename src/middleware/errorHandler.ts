import { Request, Response, NextFunction } from 'express';
import { 
  AppError,
  isOperationalError,
  parseDatabaseError,
  sendError
} from '@/utils/errors.js';
import { logger } from '@/utils/logger.js';

/**
 * Global Error Handler Middleware
 * Handles all errors in the application with proper logging and response formatting
 */

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If response is already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(error);
  }

  let appError: AppError;

  // Convert various error types to AppError
  if (error instanceof AppError) {
    appError = error;
  } else if (isDatabaseError(error)) {
    appError = parseDatabaseError(error);
  } else {
    appError = new AppError(error.message || 'Internal server error', error.statusCode || 500);
  }

  // Log error with appropriate level
  logError(appError, req);

  // Send error response using the utility from errors.js
  sendError(res, appError);
};

/**
 * Log error with contextual information
 */
function logError(error: AppError, req: Request): void {
  const errorContext = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    requestId: (req as any).id,
    statusCode: error.statusCode,
    code: error.code,
    ...(error.details && { details: error.details }),
  };

  // Determine log level based on error type and status code
  if (error.statusCode >= 500) {
    // Server errors - these are usually bugs or infrastructure issues
    logger.error(`Server Error: ${error.message}`, error, errorContext);
  } else if (error.statusCode === 429) {
    // Rate limiting - security concern
    logger.security(`Rate limit exceeded: ${error.message}`, errorContext);
  } else if (error.statusCode === 401 || error.statusCode === 403) {
    // Authentication/Authorization errors - security relevant
    logger.security(`Security Error: ${error.message}`, errorContext);
  } else if (error.statusCode >= 400) {
    // Client errors - usually user input issues
    logger.warn(`Client Error: ${error.message}`, errorContext);
  } else {
    // Unexpected status codes
    logger.error(`Unexpected Error: ${error.message}`, error, errorContext);
  }

  // Log stack trace for non-operational errors (programming errors)
  if (!error.isOperational) {
    logger.error('Stack trace:', error);
  }
}

/**
 * Check if error is a database-related error
 */
function isDatabaseError(error: any): boolean {
  if (!error) return false;
  
  // MySQL/MariaDB errors
  if (error.code && typeof error.code === 'string') {
    return error.code.startsWith('ER_') || 
           ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'].includes(error.code);
  }

  // Connection pool errors
  if (error.name === 'Error' && error.message) {
    return error.message.includes('connection') || 
           error.message.includes('timeout') ||
           error.message.includes('pool');
  }

  return false;
}

/**
 * Check if error is a validation error
 */
function isValidationError(error: any): boolean {
  if (!error) return false;
  
  return error.name === 'ValidationError' ||
         error.name === 'ValidatorError' ||
         error.name === 'CastError' ||
         (error.details && Array.isArray(error.details));
}

/**
 * 404 Not Found handler for undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );

  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  next(error);
};

/**
 * Async error wrapper for route handlers
 * Catches async errors and passes them to error handler
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error handler for express-validator
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors = errors.array().map((error: any) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    const apiError = new AppError(
      'Validation failed',
      400,
      'VALIDATION_ERROR'
    );

    logger.warn('Validation error', {
      url: req.originalUrl,
      method: req.method,
      errors: validationErrors,
    });

    return next(apiError);
  }

  next();
};

/**
 * Rate limit error handler
 */
export const rateLimitHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    'Too many requests from this IP, please try again later',
    429,
    'RATE_LIMIT_EXCEEDED'
  );

  logger.security('Rate limit exceeded', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method,
  });

  next(error);
};

/**
 * CORS error handler
 */
export const corsErrorHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    'CORS policy violation',
    403,
    'CORS_ERROR'
  );

  logger.security('CORS policy violation', {
    origin: req.get('Origin'),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method,
  });

  next(error);
};

/**
 * Multer error handler for file uploads
 */
export const multerErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    const apiError = new AppError(
      'File size too large',
      400,
      'FILE_TOO_LARGE'
    );
    return next(apiError);
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    const apiError = new AppError(
      'Too many files uploaded',
      400,
      'TOO_MANY_FILES'
    );
    return next(apiError);
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    const apiError = new AppError(
      'Unexpected file field',
      400,
      'UNEXPECTED_FILE'
    );
    return next(apiError);
  }

  // Generic multer error
  const apiError = new AppError(
    'File upload error',
    400,
    'FILE_UPLOAD_ERROR'
  );
  
  next(apiError);
};

/**
 * JSON parsing error handler
 */
export const jsonErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof SyntaxError && 'body' in error) {
    const apiError = new AppError(
      'Invalid JSON in request body',
      400,
      'INVALID_JSON'
    );
    return next(apiError);
  }

  next(error);
};

/**
 * Timeout error handler
 */
export const timeoutHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    'Request timeout',
    408,
    'REQUEST_TIMEOUT'
  );

  logger.warn('Request timeout', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  next(error);
};

/**
 * Graceful shutdown error handler
 */
export const shutdownHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    'Server is shutting down',
    503,
    'SERVER_SHUTDOWN'
  );

  logger.info('Request received during shutdown', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  next(error);
};

/**
 * Development error handler with detailed stack traces
 */
export const developmentErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    return next(error);
  }

  const apiError = error instanceof AppError ? error : new AppError(error.message || 'Internal server error', error.statusCode || 500);
  
  // Enhanced error response for development
  const errorResponse = {
    success: false,
    message: apiError.message,
    error: {
      code: apiError.code,
      message: apiError.message,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
    },
    timestamp: new Date().toISOString(),
    stack: error.stack,
  };

  // Log full error details in development
  console.error('=== DEVELOPMENT ERROR ===');
  console.error('Request:', {
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body,
  });
  console.error('Error:', error);
  console.error('========================');

  res.status(apiError.statusCode).json(errorResponse);
};

// Export appropriate error handler based on environment
export const getErrorHandler = () => {
  return process.env.NODE_ENV === 'development' 
    ? developmentErrorHandler 
    : errorHandler;
};

export default errorHandler;