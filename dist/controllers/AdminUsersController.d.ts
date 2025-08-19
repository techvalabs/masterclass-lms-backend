import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
interface AdminUsersRequest extends Request {
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
export declare class AdminUsersController {
    private db;
    constructor(database: mysql.Pool | null);
    private checkDatabaseConnection;
    /**
     * Get all users with admin filters and pagination
     * GET /api/admin/users
     */
    getUsers: (req: AdminUsersRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get single user details for admin
     * GET /api/admin/users/:id
     */
    getUserById: (req: AdminUsersRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Update user
     * PUT /api/admin/users/:id
     */
    updateUser: (req: AdminUsersRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Delete user
     * DELETE /api/admin/users/:id
     */
    deleteUser: (req: AdminUsersRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Change user role
     * POST /api/admin/users/:id/change-role
     */
    changeUserRole: (req: AdminUsersRequest, res: Response) => Promise<void>;
    /**
     * Toggle user status (activate/deactivate)
     * POST /api/admin/users/:id/toggle-status
     */
    toggleUserStatus: (req: AdminUsersRequest, res: Response) => Promise<void>;
    /**
     * Send bulk emails to users
     * POST /api/admin/users/bulk-email
     */
    sendBulkEmail: (req: AdminUsersRequest, res: Response) => Promise<void>;
    /**
     * Bulk actions on users
     * POST /api/admin/users/bulk-action
     */
    bulkAction: (req: AdminUsersRequest, res: Response) => Promise<void>;
    /**
     * Get user statistics
     * GET /api/admin/users/:id/statistics
     */
    getUserStatistics: (req: AdminUsersRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get user activity
     * GET /api/admin/users/:id/activity
     */
    getUserActivity: (req: AdminUsersRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Send email to user
     * POST /api/admin/users/:id/send-email
     */
    sendEmailToUser: (req: AdminUsersRequest, res: Response) => Promise<void>;
    /**
     * Create a new user
     */
    createUser: (req: AdminUsersRequest, res: Response) => Promise<void>;
}
export default AdminUsersController;
//# sourceMappingURL=AdminUsersController.d.ts.map