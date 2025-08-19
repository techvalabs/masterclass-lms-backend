import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
export declare class StudentController extends BaseController {
    /**
     * Get student's enrolled courses
     */
    getEnrollments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get course learning content
     */
    getCourseContent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Update lesson progress
     */
    updateLessonProgress(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Update overall course progress
     */
    private updateCourseProgress;
    /**
     * Get student dashboard data
     */
    getDashboard(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const studentController: StudentController;
//# sourceMappingURL=StudentController.d.ts.map