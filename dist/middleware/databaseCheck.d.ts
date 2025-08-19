import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to check database connectivity before processing routes
 */
export declare const checkDatabaseConnection: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default checkDatabaseConnection;
//# sourceMappingURL=databaseCheck.d.ts.map