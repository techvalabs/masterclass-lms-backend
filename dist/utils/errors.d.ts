import { Response } from 'express';
/**
 * Custom error classes for better error handling
 */
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    code?: string;
    field?: string;
    constructor(message: string, statusCode?: number, code?: string, field?: string);
}
export declare class ValidationError extends AppError {
    errors: Array<{
        field: string;
        message: string;
        code?: string;
    }>;
    constructor(message: string, errors?: Array<{
        field: string;
        message: string;
        code?: string;
    }>);
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare class DatabaseError extends AppError {
    constructor(message?: string, originalError?: Error);
}
export declare class FileUploadError extends AppError {
    constructor(message?: string);
}
export declare class EmailError extends AppError {
    constructor(message?: string);
}
export declare class PaymentError extends AppError {
    constructor(message?: string);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string);
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
        errors?: Array<{
            field: string;
            message: string;
            code?: string;
        }>;
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
export declare const sendSuccess: <T = any>(res: Response, message: string, data?: T, statusCode?: number, pagination?: ApiResponse["pagination"], meta?: Record<string, any>) => void;
/**
 * Send error response
 */
export declare const sendError: (res: Response, error: Error | AppError, statusCode?: number, includeStack?: boolean) => void;
/**
 * Async error handler wrapper
 */
export declare const asyncHandler: (fn: Function) => (req: any, res: any, next: any) => void;
/**
 * Database error parser
 */
export declare const parseDatabaseError: (error: any) => AppError;
/**
 * Global error handler middleware
 */
export declare const globalErrorHandler: (error: Error, req: any, res: Response, next: any) => any;
/**
 * 404 handler
 */
export declare const notFoundHandler: (req: any, res: Response) => void;
/**
 * Validation error helper
 */
export declare const createValidationError: (message: string, errors: Array<{
    field: string;
    message: string;
    code?: string;
}>) => ValidationError;
/**
 * Check if error is operational (expected) or programming error
 */
export declare const isOperationalError: (error: Error) => boolean;
/**
 * Error response helper for common scenarios
 */
export declare const ErrorResponses: {
    invalidCredentials: () => AuthenticationError;
    emailAlreadyExists: () => ConflictError;
    tokenExpired: () => AuthenticationError;
    invalidToken: () => AuthenticationError;
    insufficientPermissions: () => AuthorizationError;
    courseNotFound: () => NotFoundError;
    lessonNotFound: () => NotFoundError;
    userNotFound: () => NotFoundError;
    enrollmentNotFound: () => NotFoundError;
    alreadyEnrolled: () => ConflictError;
    courseNotPublished: () => ValidationError;
    paymentRequired: () => PaymentError;
    fileTooBig: (maxSize: string) => FileUploadError;
    unsupportedFileType: (allowedTypes: string[]) => FileUploadError;
    quizNotFound: () => NotFoundError;
    quizAlreadyCompleted: () => ConflictError;
    maxAttemptsReached: () => ValidationError;
    certificateNotEarned: () => ValidationError;
    emailNotVerified: () => ValidationError;
    accountDeactivated: () => AuthenticationError;
};
declare const _default: {
    AppError: typeof AppError;
    ValidationError: typeof ValidationError;
    AuthenticationError: typeof AuthenticationError;
    AuthorizationError: typeof AuthorizationError;
    NotFoundError: typeof NotFoundError;
    ConflictError: typeof ConflictError;
    DatabaseError: typeof DatabaseError;
    FileUploadError: typeof FileUploadError;
    EmailError: typeof EmailError;
    PaymentError: typeof PaymentError;
    RateLimitError: typeof RateLimitError;
    sendSuccess: <T = any>(res: Response, message: string, data?: T, statusCode?: number, pagination?: ApiResponse["pagination"], meta?: Record<string, any>) => void;
    sendError: (res: Response, error: Error | AppError, statusCode?: number, includeStack?: boolean) => void;
    asyncHandler: (fn: Function) => (req: any, res: any, next: any) => void;
    globalErrorHandler: (error: Error, req: any, res: Response, next: any) => any;
    notFoundHandler: (req: any, res: Response) => void;
    createValidationError: (message: string, errors: Array<{
        field: string;
        message: string;
        code?: string;
    }>) => ValidationError;
    isOperationalError: (error: Error) => boolean;
    ErrorResponses: {
        invalidCredentials: () => AuthenticationError;
        emailAlreadyExists: () => ConflictError;
        tokenExpired: () => AuthenticationError;
        invalidToken: () => AuthenticationError;
        insufficientPermissions: () => AuthorizationError;
        courseNotFound: () => NotFoundError;
        lessonNotFound: () => NotFoundError;
        userNotFound: () => NotFoundError;
        enrollmentNotFound: () => NotFoundError;
        alreadyEnrolled: () => ConflictError;
        courseNotPublished: () => ValidationError;
        paymentRequired: () => PaymentError;
        fileTooBig: (maxSize: string) => FileUploadError;
        unsupportedFileType: (allowedTypes: string[]) => FileUploadError;
        quizNotFound: () => NotFoundError;
        quizAlreadyCompleted: () => ConflictError;
        maxAttemptsReached: () => ValidationError;
        certificateNotEarned: () => ValidationError;
        emailNotVerified: () => ValidationError;
        accountDeactivated: () => AuthenticationError;
    };
};
export default _default;
//# sourceMappingURL=errors.d.ts.map