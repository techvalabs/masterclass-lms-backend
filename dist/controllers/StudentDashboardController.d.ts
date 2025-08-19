import { Response } from 'express';
import { BaseController } from './BaseController.js';
export declare class StudentDashboardController extends BaseController {
    /**
     * Get student dashboard statistics
     */
    getDashboardStats(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get recent learning activity
     */
    getRecentActivity(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get weekly progress data
     */
    getWeeklyProgress(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get leaderboard
     */
    getLeaderboard(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Toggle course favorite
     */
    toggleCourseFavorite(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get recommended courses
     */
    getRecommendedCourses(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get learning streaks
     */
    getLearningStreaks(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get achievements and badges
     */
    getAchievements(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const studentDashboardController: StudentDashboardController;
//# sourceMappingURL=StudentDashboardController.d.ts.map