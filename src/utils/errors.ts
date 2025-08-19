import { Response } from 'express';
import { logger } from './logger.js';

/**
 * Custom error classes for better error handling
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public field?: string;

  constructor(message: string, statusCode: number = 500, code?: string, field?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.field = field;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public errors: Array<{ field: string; message: string; code?: string }>;

  constructor(message: string, errors: Array<{ field: string; message: string; code?: string }> = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', originalError?: Error) {
    super(message, 500, 'DATABASE_ERROR');
    
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

export class FileUploadError extends AppError {
  constructor(message: string = 'File upload failed') {
    super(message, 400, 'FILE_UPLOAD_ERROR');
  }
}

export class EmailError extends AppError {
  constructor(message: string = 'Email operation failed') {
    super(message, 500, 'EMAIL_ERROR');
  }
}

export class PaymentError extends AppError {
  constructor(message: string = 'Payment processing failed') {
    super(message, 402, 'PAYMENT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code?: string;
    message: string;
    field?: string;
    errors?: Array<{ field: string; message: string; code?: string }>;
    stack?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  meta?: Record<string, any>;
}

/**
 * Send success response
 */
export const sendSuccess = <T = any>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200,
  pagination?: ApiResponse['pagination'],
  meta?: Record<string, any>
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    pagination,
    meta
  };

  res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  error: Error | AppError,
  statusCode?: number,
  includeStack: boolean = false
): void => {
  let code: string | undefined;
  let field: string | undefined;
  let errors: Array<{ field: string; message: string; code?: string }> | undefined;
  let finalStatusCode = statusCode || 500;
  let message = error.message || 'Internal server error';

  if (error instanceof AppError) {
    finalStatusCode = error.statusCode;
    code = error.code;
    field = error.field;
    
    if (error instanceof ValidationError) {
      errors = error.errors;
    }
  }

  // Log the error
  logger.error('API Error', {
    message: error.message,
    statusCode: finalStatusCode,
    code,
    field,
    errors,
    stack: error.stack,
    url: res.req?.originalUrl,
    method: res.req?.method,
    userAgent: res.req?.get('User-Agent'),
    ip: res.req?.ip,
    userId: (res.req as any)?.user?.id
  });

  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code,
      message,
      field,
      errors,
      ...(includeStack && process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  };

  res.status(finalStatusCode).json(response);
};

/**
 * Async error handler wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Database error parser
 */
export const parseDatabaseError = (error: any): AppError => {
  // MySQL error codes
  if (error.code) {
    switch (error.code) {
      case 'ER_DUP_ENTRY':
        const field = error.sqlMessage?.match(/for key '([^']+)'/)?.[1] || 'field';
        return new ConflictError(`Duplicate entry for ${field}`);
      
      case 'ER_NO_REFERENCED_ROW_2':
        return new ValidationError('Referenced record does not exist');
      
      case 'ER_ROW_IS_REFERENCED_2':
        return new ConflictError('Cannot delete record, it is referenced by other records');
      
      case 'ER_DATA_TOO_LONG':
        return new ValidationError('Data too long for field');
      
      case 'ER_BAD_NULL_ERROR':
        const nullField = error.sqlMessage?.match(/Column '([^']+)'/)?.[1] || 'field';
        return new ValidationError(`Field '${nullField}' cannot be null`);
      
      case 'ER_PARSE_ERROR':
        return new DatabaseError('SQL syntax error');
      
      case 'ECONNREFUSED':
        return new DatabaseError('Database connection refused');
      
      case 'ER_ACCESS_DENIED_ERROR':
        return new DatabaseError('Database access denied');
      
      default:
        return new DatabaseError(error.message || 'Database error occurred', error);
    }
  }
  
  return new DatabaseError('Unknown database error', error);
};

/**
 * Global error handler middleware
 */
export const globalErrorHandler = (error: Error, req: any, res: Response, next: any) => {
  // If response already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(error);
  }

  // Parse database errors
  if (error.name === 'Error' && (error as any).code) {
    error = parseDatabaseError(error);
  }

  // Handle different error types
  const includeStack = process.env.NODE_ENV === 'development' && 
                      process.env.ENABLE_DETAILED_ERRORS === 'true';
  
  sendError(res, error, undefined, includeStack);
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: any, res: Response) => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
  sendError(res, error);
};

/**
 * Validation error helper
 */
export const createValidationError = (message: string, errors: Array<{ field: string; message: string; code?: string }>) => {
  return new ValidationError(message, errors);
};

/**
 * Check if error is operational (expected) or programming error
 */
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Error response helper for common scenarios
 */
export const ErrorResponses = {
  invalidCredentials: () => new AuthenticationError('Invalid email or password'),
  
  emailAlreadyExists: () => new ConflictError('Email address already registered'),
  
  tokenExpired: () => new AuthenticationError('Token has expired'),
  
  invalidToken: () => new AuthenticationError('Invalid or malformed token'),
  
  insufficientPermissions: () => new AuthorizationError('You do not have permission to perform this action'),
  
  courseNotFound: () => new NotFoundError('Course not found'),
  
  lessonNotFound: () => new NotFoundError('Lesson not found'),
  
  userNotFound: () => new NotFoundError('User not found'),
  
  enrollmentNotFound: () => new NotFoundError('Enrollment not found'),
  
  alreadyEnrolled: () => new ConflictError('User is already enrolled in this course'),
  
  courseNotPublished: () => new ValidationError('Course is not published'),
  
  paymentRequired: () => new PaymentError('Payment is required to access this course'),
  
  fileTooBig: (maxSize: string) => new FileUploadError(`File size exceeds limit of ${maxSize}`),
  
  unsupportedFileType: (allowedTypes: string[]) => 
    new FileUploadError(`Unsupported file type. Allowed types: ${allowedTypes.join(', ')}`),
  
  quizNotFound: () => new NotFoundError('Quiz not found'),
  
  quizAlreadyCompleted: () => new ConflictError('Quiz has already been completed'),
  
  maxAttemptsReached: () => new ValidationError('Maximum number of attempts reached'),
  
  certificateNotEarned: () => new ValidationError('Certificate not earned yet'),
  
  emailNotVerified: () => new ValidationError('Email address not verified'),
  
  accountDeactivated: () => new AuthenticationError('Account has been deactivated'),
};

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  FileUploadError,
  EmailError,
  PaymentError,
  RateLimitError,
  sendSuccess,
  sendError,
  asyncHandler,
  globalErrorHandler,
  notFoundHandler,
  createValidationError,
  isOperationalError,
  ErrorResponses
};