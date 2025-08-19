import { Router } from 'express';
import mysql from 'mysql2/promise';
/**
 * Admin Routes Module
 * All routes require admin authentication
 */
export declare function createAdminRoutes(db: mysql.Pool | null): Router;
export default createAdminRoutes;
//# sourceMappingURL=admin.d.ts.map