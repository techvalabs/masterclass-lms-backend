import { Request, Response } from 'express';
export declare class CourseController {
    getCategories: (req: Request, res: Response) => Promise<void>;
    getCourses: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    searchCourses: (req: Request, res: Response) => Promise<void>;
    getFeaturedCourses: (req: Request, res: Response) => Promise<void>;
    getFreeCourses: (req: Request, res: Response) => Promise<void>;
    getCoursesByCategory: (req: Request, res: Response) => Promise<void>;
    getCourseById: (req: Request, res: Response) => Promise<void>;
    getCoursePreview: (req: Request, res: Response) => Promise<void>;
    getCourseModules: (req: Request, res: Response) => Promise<void>;
    getCourseReviews: (req: Request, res: Response) => Promise<void>;
    enrollInCourse: (req: Request, res: Response) => Promise<void>;
    getEnrollmentStatus: (req: Request, res: Response) => Promise<void>;
    getCourseContent: (req: Request, res: Response) => Promise<void>;
    getLesson: (req: Request, res: Response) => Promise<void>;
    updateLessonProgress: (req: Request, res: Response) => Promise<void>;
    getCourseProgress: (req: Request, res: Response) => Promise<void>;
    addCourseReview: (req: Request, res: Response) => Promise<void>;
    updateCourseReview: (req: Request, res: Response) => Promise<void>;
    deleteCourseReview: (req: Request, res: Response) => Promise<void>;
    getCertificate: (req: Request, res: Response) => Promise<void>;
    downloadResource: (req: Request, res: Response) => Promise<void>;
    createCourse: (req: Request, res: Response) => Promise<void>;
    updateCourse: (req: Request, res: Response) => Promise<void>;
    deleteCourse: (req: Request, res: Response) => Promise<void>;
    toggleCoursePublication: (req: Request, res: Response) => Promise<void>;
    getCourseAnalytics: (req: Request, res: Response) => Promise<void>;
    getCourseEnrollments: (req: Request, res: Response) => Promise<void>;
    getAllCoursesAdmin: (req: Request, res: Response) => Promise<void>;
    toggleCourseFeatured: (req: Request, res: Response) => Promise<void>;
    bulkCourseAction: (req: Request, res: Response) => Promise<void>;
    analyzeVideosForPricing: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=CourseController.d.ts.map