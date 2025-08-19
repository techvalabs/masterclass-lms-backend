import { Request, Response, NextFunction } from 'express';
/**
 * Global Error Handler Middleware
 * Handles all errors in the application with proper logging and response formatting
 */
export declare const errorHandler: (error: any, req: Request, res: Response, next: NextFunction) => void;
/**
 * 404 Not Found handler for undefined routes
 */
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Async error wrapper for route handlers
 * Catches async errors and passes them to error handler
 */
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validation error handler for express-validator
 */
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Rate limit error handler
 */
export declare const rateLimitHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * CORS error handler
 */
export declare const corsErrorHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Multer error handler for file uploads
 */
export declare const multerErrorHandler: (error: any, req: Request, res: Response, next: NextFunction) => void;
/**
 * JSON parsing error handler
 */
export declare const jsonErrorHandler: (error: any, req: Request, res: Response, next: NextFunction) => void;
/**
 * Timeout error handler
 */
export declare const timeoutHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Graceful shutdown error handler
 */
export declare const shutdownHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Development error handler with detailed stack traces
 */
export declare const developmentErrorHandler: (error: any, req: Request, res: Response, next: NextFunction) => void;
export declare const getErrorHandler: () => (error: any, req: Request, res: Response, next: NextFunction) => void;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map