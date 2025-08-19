import { Request, Response } from 'express';
import multer from 'multer';
export declare const upload: multer.Multer;
export declare class AdminCourseController {
    getAllCourses: (req: Request, res: Response) => Promise<void>;
    createCourse: (req: Request, res: Response) => Promise<void>;
    createModule: (req: Request, res: Response) => Promise<void>;
    createLesson: (req: Request, res: Response) => Promise<void>;
    uploadLessonVideo: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createQuiz: (req: Request, res: Response) => Promise<void>;
    updateCourse: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteCourse: (req: Request, res: Response) => Promise<void>;
    togglePublication: (req: Request, res: Response) => Promise<void>;
    getCourseStats: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=AdminCourseController.d.ts.map