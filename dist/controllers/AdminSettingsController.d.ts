import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
interface AdminSettingsRequest extends Request {
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
export declare class AdminSettingsController {
    private db;
    constructor(database: mysql.Pool | null);
    private checkDatabaseConnection;
    /**
     * Get all system settings
     * GET /api/admin/settings
     */
    getSettings: (req: AdminSettingsRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Update system settings by category
     * PUT /api/admin/settings/:category
     */
    updateSettings: (req: AdminSettingsRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get system information
     * GET /api/admin/settings/system-info
     */
    getSystemInfo: (req: AdminSettingsRequest, res: Response) => Promise<void>;
    /**
     * Create database backup
     * POST /api/admin/settings/backup
     */
    createBackup: (req: AdminSettingsRequest, res: Response) => Promise<void>;
    /**
     * Get backup status
     * GET /api/admin/settings/backup/:id
     */
    getBackupStatus: (req: AdminSettingsRequest, res: Response) => Promise<void>;
    /**
     * Get all backups
     * GET /api/admin/settings/backups
     */
    getBackups: (req: AdminSettingsRequest, res: Response) => Promise<void>;
    /**
     * Delete backup
     * DELETE /api/admin/settings/backup/:id
     */
    deleteBackup: (req: AdminSettingsRequest, res: Response) => Promise<void>;
    /**
     * Clear application cache
     * POST /api/admin/settings/clear-cache
     */
    clearCache: (req: AdminSettingsRequest, res: Response) => Promise<void>;
    private performBackupAsync;
    private updateBackupStatus;
    /**
     * Log settings changes for audit trail
     */
    private logSettingsChange;
}
export default AdminSettingsController;
//# sourceMappingURL=AdminSettingsController.d.ts.map