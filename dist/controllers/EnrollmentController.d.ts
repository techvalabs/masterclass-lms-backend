import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
export declare class EnrollmentController extends BaseController {
    createEnrollment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMyEnrollments(req: Request, res: Response): Promise<void>;
    getCourseEnrollment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateLessonProgress(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    submitQuizAttempt(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCertificate(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=EnrollmentController.d.ts.map