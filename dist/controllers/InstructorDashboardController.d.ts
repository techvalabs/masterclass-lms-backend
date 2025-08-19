import { Response } from 'express';
import { BaseController } from './BaseController.js';
export declare class InstructorDashboardController extends BaseController {
    /**
     * Get instructor dashboard statistics
     */
    getDashboardStats(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get recent activity for instructor
     */
    getRecentActivity(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get course performance metrics
     */
    getCourseMetrics(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get student progress for instructor's courses
     */
    getStudentProgress(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const instructorDashboardController: InstructorDashboardController;
//# sourceMappingURL=InstructorDashboardController.d.ts.map