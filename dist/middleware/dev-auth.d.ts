import { Request, Response, NextFunction } from 'express';
/**
 * Development authentication middleware for file-based users
 * Used when database is not available
 */
export declare function devAuthenticate(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Development admin authorization middleware
 */
export declare function devRequireAdmin(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
/**
 * Combined dev auth + admin middleware
 */
export declare function devAuthenticateAdmin(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=dev-auth.d.ts.map