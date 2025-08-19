import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
interface AdminDashboardRequest extends Request {
    user: {
        id: number;
        email: string;
        name: string;
        role: string;
        roleId: number;
        permissions: string[];
        isVerified: boolean;
        isActive: boolean;
    };
}
export declare class AdminDashboardController {
    private db;
    constructor(database: mysql.Pool | null);
    private getDatabase;
    private checkDatabaseConnection;
    /**
     * Get dashboard statistics
     * GET /api/admin/dashboard/stats
     */
    getDashboardStats: (req: AdminDashboardRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get recent users
     * GET /api/admin/dashboard/recent-users
     */
    getRecentUsers: (req: AdminDashboardRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get recent courses
     * GET /api/admin/dashboard/recent-courses
     */
    getRecentCourses: (req: AdminDashboardRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get analytics data
     * GET /api/admin/analytics
     */
    getAnalytics: (req: AdminDashboardRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
}
export default AdminDashboardController;
//# sourceMappingURL=AdminDashboardController.d.ts.map