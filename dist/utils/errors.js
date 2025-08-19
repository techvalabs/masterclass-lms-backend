import { logger } from './logger.js';
/**
 * Custom error classes for better error handling
 */
export class AppError extends Error {
    statusCode;
    isOperational;
    code;
    field;
    constructor(message, statusCode = 500, code, field) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.code = code;
        this.field = field;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class ValidationError extends AppError {
    errors;
    constructor(message, errors = []) {
        super(message, 400, 'VALIDATION_ERROR');
        this.errors = errors;
    }
}
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}
export class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}
export class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409, 'CONFLICT');
    }
}
export class DatabaseError extends AppError {
    constructor(message = 'Database operation failed', originalError) {
        super(message, 500, 'DATABASE_ERROR');
        if (originalError) {
            this.stack = originalError.stack;
        }
    }
}
export class FileUploadError extends AppError {
    constructor(message = 'File upload failed') {
        super(message, 400, 'FILE_UPLOAD_ERROR');
    }
}
export class EmailError extends AppError {
    constructor(message = 'Email operation failed') {
        super(message, 500, 'EMAIL_ERROR');
    }
}
export class PaymentError extends AppError {
    constructor(message = 'Payment processing failed') {
        super(message, 402, 'PAYMENT_ERROR');
    }
}
export class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429, 'RATE_LIMIT_ERROR');
    }
}
/**
 * Send success response
 */
export const sendSuccess = (res, message, data, statusCode = 200, pagination, meta) => {
    const response = {
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
export const sendError = (res, error, statusCode, includeStack = false) => {
    let code;
    let field;
    let errors;
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
        userId: res.req?.user?.id
    });
    const response = {
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
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
/**
 * Database error parser
 */
export const parseDatabaseError = (error) => {
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
export const globalErrorHandler = (error, req, res, next) => {
    // If response already sent, delegate to default Express error handler
    if (res.headersSent) {
        return next(error);
    }
    // Parse database errors
    if (error.name === 'Error' && error.code) {
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
export const notFoundHandler = (req, res) => {
    const error = new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
    sendError(res, error);
};
/**
 * Validation error helper
 */
export const createValidationError = (message, errors) => {
    return new ValidationError(message, errors);
};
/**
 * Check if error is operational (expected) or programming error
 */
export const isOperationalError = (error) => {
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
    fileTooBig: (maxSize) => new FileUploadError(`File size exceeds limit of ${maxSize}`),
    unsupportedFileType: (allowedTypes) => new FileUploadError(`Unsupported file type. Allowed types: ${allowedTypes.join(', ')}`),
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
//# sourceMappingURL=errors.js.map