import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
interface AdminAnalyticsRequest extends Request {
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
export declare class AdminAnalyticsController {
    private db;
    constructor(database: mysql.Pool | null);
    private checkDatabaseConnection;
    private getDatabase;
    /**
     * Get dashboard overview analytics
     * GET /api/admin/analytics/overview
     */
    getOverview: (req: AdminAnalyticsRequest, res: Response) => Promise<void>;
    /**
     * Get revenue analytics
     * GET /api/admin/analytics/revenue
     */
    getRevenue: (req: AdminAnalyticsRequest, res: Response) => Promise<void>;
    /**
     * Get user analytics
     * GET /api/admin/analytics/users
     */
    getUsers: (req: AdminAnalyticsRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get course analytics
     * GET /api/admin/analytics/courses
     */
    getCourses: (req: AdminAnalyticsRequest, res: Response) => Promise<void>;
    /**
     * Export analytics data
     * GET /api/admin/analytics/export
     */
    exportData: (req: AdminAnalyticsRequest, res: Response) => Promise<void>;
    private getDateRange;
    private getPreviousDateRange;
    private getOverviewStats;
    private getRecentActivities;
    private getTopCourses;
    private getUserGrowthData;
    private getRevenueData;
    private getRevenueOverTime;
    private getRevenueByCourse;
    private getRevenueByPaymentMethod;
    private getRevenueByInstructor;
    private getRefundAnalytics;
    private getTransactionAnalytics;
    private getUserRegistrationsOverTime;
    private getUserDemographics;
    private getUserEngagement;
    private getUserRetention;
    private getMostActiveUsers;
    private getCoursePerformance;
    private getEnrollmentTrends;
    private getCompletionRatesByCourse;
    private getCourseRatingsAnalytics;
    private getPopularCourses;
    private getCategoryPerformance;
    private getExportOverviewData;
    private getExportRevenueData;
    private getExportUsersData;
    private getExportCoursesData;
    private convertToCSV;
}
export default AdminAnalyticsController;
//# sourceMappingURL=AdminAnalyticsController.d.ts.map