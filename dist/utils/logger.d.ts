import winston from 'winston';
export declare const logger: winston.Logger;
export declare const morganStream: {
    write: (message: string) => void;
};
export declare const logError: (message: string, error?: Error | any, metadata?: any) => void;
export declare const logInfo: (message: string, metadata?: any) => void;
export declare const logWarn: (message: string, metadata?: any) => void;
export declare const logDebug: (message: string, metadata?: any) => void;
export declare const logQuery: (sql: string, params?: any[], duration?: number) => void;
export declare const logApiRequest: (method: string, url: string, userId?: number, metadata?: any) => void;
export declare const logApiResponse: (method: string, url: string, status: number, duration: number, userId?: number) => void;
export declare const logAuth: (action: string, email?: string, success?: boolean, metadata?: any) => void;
export declare const logFileOperation: (action: string, filename: string, success?: boolean, metadata?: any) => void;
export declare const logEmail: (to: string, subject: string, success?: boolean, metadata?: any) => void;
export declare const logSecurity: (event: string, ip?: string, userAgent?: string, metadata?: any) => void;
export declare const logPerformance: (operation: string, duration: number, metadata?: any) => void;
export declare const morganFormat: string;
export default logger;
//# sourceMappingURL=logger.d.ts.map