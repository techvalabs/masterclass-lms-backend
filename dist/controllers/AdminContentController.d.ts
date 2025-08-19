import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
interface AdminContentRequest extends Request {
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
export declare class AdminContentController {
    private db;
    private uploadConfig;
    constructor(database: mysql.Pool | null);
    /**
     * Configure multer for file uploads
     */
    private getMulterConfig;
    /**
     * Upload files
     * POST /api/admin/content/upload
     */
    uploadFiles: (req: AdminContentRequest, res: Response) => Promise<void>;
    /**
     * Determine file type from MIME type
     */
    private determineFileType;
    /**
     * Get all uploaded files with filters and pagination
     * GET /api/admin/content/files
     */
    getFiles: (req: AdminContentRequest, res: Response) => Promise<void>;
    /**
     * Get file by ID
     * GET /api/admin/content/files/:id
     */
    getFileById: (req: AdminContentRequest, res: Response) => Promise<void>;
    /**
     * Update file metadata
     * PUT /api/admin/content/files/:id
     */
    updateFile: (req: AdminContentRequest, res: Response) => Promise<void>;
    /**
     * Delete file
     * DELETE /api/admin/content/files/:id
     */
    deleteFile: (req: AdminContentRequest, res: Response) => Promise<void>;
    /**
     * Bulk delete files
     * POST /api/admin/content/files/bulk-delete
     */
    bulkDeleteFiles: (req: AdminContentRequest, res: Response) => Promise<void>;
    /**
     * Process file asynchronously (placeholder)
     */
    private processFileAsync;
}
export default AdminContentController;
//# sourceMappingURL=AdminContentController.d.ts.map