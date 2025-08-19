import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
interface AdminCoursesRequest extends Request {
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
export declare class AdminCoursesController {
    private db;
    constructor(database: mysql.Pool | null);
    private getDatabase;
    private checkDatabaseConnection;
    /**
     * Get all courses with admin filters and pagination
     * GET /api/admin/courses
     */
    getCourses: (req: AdminCoursesRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get single course details for admin
     * GET /api/admin/courses/:id
     */
    getCourseById: (req: AdminCoursesRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Create new course
     * POST /api/admin/courses
     */
    createCourse: (req: AdminCoursesRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Update course
     * PUT /api/admin/courses/:id
     */
    updateCourse: (req: AdminCoursesRequest, res: Response) => Promise<void>;
    /**
     * Delete course
     * DELETE /api/admin/courses/:id
     */
    deleteCourse: (req: AdminCoursesRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Toggle course publish status
     * PATCH /api/admin/courses/:id/publish
     */
    togglePublishStatus: (req: AdminCoursesRequest, res: Response) => Promise<void>;
    /**
     * Duplicate course
     * POST /api/admin/courses/:id/duplicate
     */
    duplicateCourse: (req: AdminCoursesRequest, res: Response) => Promise<void>;
    /**
     * Approve course
     * POST /api/admin/courses/:id/approve
     */
    approveCourse: (req: AdminCoursesRequest, res: Response) => Promise<void>;
    /**
     * Reject course
     * POST /api/admin/courses/:id/reject
     */
    rejectCourse: (req: AdminCoursesRequest, res: Response) => Promise<void>;
    /**
     * Bulk actions on courses
     * POST /api/admin/courses/bulk-action
     */
    bulkAction: (req: AdminCoursesRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
}
export default AdminCoursesController;
//# sourceMappingURL=AdminCoursesController.d.ts.map