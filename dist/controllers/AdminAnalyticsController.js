import { ValidationError, DatabaseError } from '../utils/errors.js';
export class AdminAnalyticsController {
    db;
    constructor(database) {
        this.db = database;
    }
    checkDatabaseConnection() {
        return this.db !== null && this.db !== undefined;
    }
    getDatabase() {
        // Try to get global database instance first
        try {
            const { db } = require('../config/database.js');
            const globalDb = db.getPool();
            if (globalDb) {
                this.db = globalDb; // Store for future use
                return globalDb;
            }
        }
        catch (e) {
            console.log('⚠️ Global database not available:', e.message);
        }
        if (!this.db) {
            console.log('❌ No database available for analytics');
            throw new DatabaseError('Database not available');
        }
        return this.db;
    }
    /**
     * Get dashboard overview analytics
     * GET /api/admin/analytics/overview
     */
    getOverview = async (req, res) => {
        try {
            const { period = 'month' } = req.query;
            // Calculate date range based on period
            const dateRange = this.getDateRange(period, req.query.startDate, req.query.endDate);
            const previousDateRange = this.getPreviousDateRange(period, dateRange.startDate, dateRange.endDate);
            // Get current period stats
            const currentStats = await this.getOverviewStats(dateRange.startDate, dateRange.endDate);
            // Get previous period stats for comparison
            const previousStats = await this.getOverviewStats(previousDateRange.startDate, previousDateRange.endDate);
            // Calculate percentage changes
            const calculateChange = (current, previous) => {
                if (previous === 0)
                    return current > 0 ? 100 : 0;
                return Math.round(((current - previous) / previous) * 100);
            };
            // Get recent activities
            const recentActivities = await this.getRecentActivities();
            // Get top performing courses
            const topCourses = await this.getTopCourses(dateRange.startDate, dateRange.endDate);
            // Get user growth data
            const userGrowth = await this.getUserGrowthData(dateRange.startDate, dateRange.endDate);
            // Get revenue data
            const revenueData = await this.getRevenueData(dateRange.startDate, dateRange.endDate);
            const response = {
                success: true,
                data: {
                    overview: {
                        totalUsers: {
                            current: currentStats.totalUsers,
                            previous: previousStats.totalUsers,
                            change: calculateChange(currentStats.totalUsers, previousStats.totalUsers)
                        },
                        totalCourses: {
                            current: currentStats.totalCourses,
                            previous: previousStats.totalCourses,
                            change: calculateChange(currentStats.totalCourses, previousStats.totalCourses)
                        },
                        totalEnrollments: {
                            current: currentStats.totalEnrollments,
                            previous: previousStats.totalEnrollments,
                            change: calculateChange(currentStats.totalEnrollments, previousStats.totalEnrollments)
                        },
                        totalRevenue: {
                            current: currentStats.totalRevenue,
                            previous: previousStats.totalRevenue,
                            change: calculateChange(currentStats.totalRevenue, previousStats.totalRevenue)
                        },
                        activeStudents: {
                            current: currentStats.activeStudents,
                            previous: previousStats.activeStudents,
                            change: calculateChange(currentStats.activeStudents, previousStats.activeStudents)
                        },
                        courseCompletions: {
                            current: currentStats.courseCompletions,
                            previous: previousStats.courseCompletions,
                            change: calculateChange(currentStats.courseCompletions, previousStats.courseCompletions)
                        },
                        averageRating: currentStats.averageRating,
                        completionRate: currentStats.completionRate
                    },
                    recentActivities,
                    topCourses,
                    userGrowth,
                    revenueData,
                    period: {
                        current: dateRange,
                        previous: previousDateRange
                    }
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get overview analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch overview analytics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    /**
     * Get revenue analytics
     * GET /api/admin/analytics/revenue
     */
    getRevenue = async (req, res) => {
        try {
            const { period = 'month', granularity = 'day' } = req.query;
            const dateRange = this.getDateRange(period, req.query.startDate, req.query.endDate);
            // Get revenue over time
            const revenueOverTime = await this.getRevenueOverTime(dateRange.startDate, dateRange.endDate, granularity);
            // Get revenue by course
            const revenueByCourse = await this.getRevenueByCourse(dateRange.startDate, dateRange.endDate);
            // Get revenue by payment method
            const revenueByPaymentMethod = await this.getRevenueByPaymentMethod(dateRange.startDate, dateRange.endDate);
            // Get revenue by instructor
            const revenueByInstructor = await this.getRevenueByInstructor(dateRange.startDate, dateRange.endDate);
            // Get refund analytics
            const refundAnalytics = await this.getRefundAnalytics(dateRange.startDate, dateRange.endDate);
            // Get transaction analytics
            const transactionAnalytics = await this.getTransactionAnalytics(dateRange.startDate, dateRange.endDate);
            const response = {
                success: true,
                data: {
                    summary: {
                        totalRevenue: revenueOverTime.reduce((sum, item) => sum + item.revenue, 0),
                        totalTransactions: transactionAnalytics.totalTransactions,
                        averageOrderValue: transactionAnalytics.averageOrderValue,
                        totalRefunds: refundAnalytics.totalRefunds,
                        refundRate: refundAnalytics.refundRate
                    },
                    revenueOverTime,
                    revenueByCourse,
                    revenueByPaymentMethod,
                    revenueByInstructor,
                    refundAnalytics,
                    transactionAnalytics,
                    period: dateRange
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get revenue analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch revenue analytics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    /**
     * Get user analytics
     * GET /api/admin/analytics/users
     */
    getUsers = async (req, res) => {
        try {
            // Check database connection first
            if (!this.checkDatabaseConnection()) {
                // Return mock data when database is not available
                return res.json({
                    success: true,
                    data: {
                        userRegistrations: [],
                        userDemographics: {
                            byRole: [],
                            byLocation: [],
                            byDevice: []
                        },
                        userEngagement: {
                            dailyActiveUsers: 0,
                            weeklyActiveUsers: 0,
                            monthlyActiveUsers: 0,
                            averageSessionDuration: 0
                        },
                        userRetention: {
                            day1: 0,
                            day7: 0,
                            day30: 0
                        },
                        mostActiveUsers: []
                    },
                    message: 'Database not available - showing empty data'
                });
            }
            const { period = 'month', granularity = 'day' } = req.query;
            const dateRange = this.getDateRange(period, req.query.startDate, req.query.endDate);
            // Get user registrations over time
            const userRegistrations = await this.getUserRegistrationsOverTime(dateRange.startDate, dateRange.endDate, granularity);
            // Get user demographics
            const userDemographics = await this.getUserDemographics();
            // Get user engagement metrics
            const userEngagement = await this.getUserEngagement(dateRange.startDate, dateRange.endDate);
            // Get user retention data
            const userRetention = await this.getUserRetention();
            // Get most active users
            const mostActiveUsers = await this.getMostActiveUsers(dateRange.startDate, dateRange.endDate);
            const response = {
                success: true,
                data: {
                    userRegistrations,
                    userDemographics,
                    userEngagement,
                    userRetention,
                    mostActiveUsers,
                    period: dateRange
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get user analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user analytics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    /**
     * Get course analytics
     * GET /api/admin/analytics/courses
     */
    getCourses = async (req, res) => {
        try {
            const { period = 'month' } = req.query;
            const dateRange = this.getDateRange(period, req.query.startDate, req.query.endDate);
            // Get course performance metrics
            const coursePerformance = await this.getCoursePerformance(dateRange.startDate, dateRange.endDate);
            // Get enrollment trends
            const enrollmentTrends = await this.getEnrollmentTrends(dateRange.startDate, dateRange.endDate);
            // Get completion rates by course
            const completionRates = await this.getCompletionRatesByCourse();
            // Get course ratings and reviews
            const courseRatings = await this.getCourseRatingsAnalytics();
            // Get popular courses
            const popularCourses = await this.getPopularCourses(dateRange.startDate, dateRange.endDate);
            // Get course category performance
            const categoryPerformance = await this.getCategoryPerformance(dateRange.startDate, dateRange.endDate);
            const response = {
                success: true,
                data: {
                    coursePerformance,
                    enrollmentTrends,
                    completionRates,
                    courseRatings,
                    popularCourses,
                    categoryPerformance,
                    period: dateRange
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get course analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch course analytics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    /**
     * Export analytics data
     * GET /api/admin/analytics/export
     */
    exportData = async (req, res) => {
        try {
            const { type = 'overview', format = 'json', period = 'month' } = req.query;
            const dateRange = this.getDateRange(period, req.query.startDate, req.query.endDate);
            let data;
            switch (type) {
                case 'overview':
                    data = await this.getExportOverviewData(dateRange.startDate, dateRange.endDate);
                    break;
                case 'revenue':
                    data = await this.getExportRevenueData(dateRange.startDate, dateRange.endDate);
                    break;
                case 'users':
                    data = await this.getExportUsersData(dateRange.startDate, dateRange.endDate);
                    break;
                case 'courses':
                    data = await this.getExportCoursesData(dateRange.startDate, dateRange.endDate);
                    break;
                default:
                    throw new ValidationError('Invalid export type');
            }
            // Log export activity
            await this.getDatabase().execute('INSERT INTO activity_logs (user_id, action, entity_type, description, metadata, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [
                req.user.id,
                'analytics_export',
                'export',
                `Exported ${type} analytics data`,
                JSON.stringify({ type, format, period, dateRange })
            ]);
            if (format === 'csv') {
                // Convert data to CSV format
                const csv = this.convertToCSV(data);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="${type}-analytics-${Date.now()}.csv"`);
                res.send(csv);
            }
            else {
                res.json({
                    success: true,
                    data,
                    metadata: {
                        type,
                        format,
                        period: dateRange,
                        exportedAt: new Date().toISOString(),
                        recordCount: Array.isArray(data) ? data.length : Object.keys(data).length
                    }
                });
            }
        }
        catch (error) {
            console.error('Export analytics error:', error);
            if (error instanceof ValidationError) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to export analytics data',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
    // Helper methods
    getDateRange(period, startDate, endDate) {
        const now = new Date();
        let start, end;
        if (period === 'custom' && startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        }
        else {
            end = new Date(now);
            switch (period) {
                case 'today':
                    start = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'quarter':
                    start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case 'year':
                    start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }
        }
        return {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        };
    }
    getPreviousDateRange(period, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const duration = end.getTime() - start.getTime();
        return {
            startDate: new Date(start.getTime() - duration).toISOString().split('T')[0],
            endDate: new Date(end.getTime() - duration).toISOString().split('T')[0]
        };
    }
    async getOverviewStats(startDate, endDate) {
        const [stats] = await this.getDatabase().execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE created_at BETWEEN ? AND ?) as totalUsers,
        (SELECT COUNT(*) FROM courses WHERE created_at BETWEEN ? AND ?) as totalCourses,
        (SELECT COUNT(*) FROM enrollments WHERE enrolled_at BETWEEN ? AND ?) as totalEnrollments,
        (SELECT COALESCE(SUM(amount), 0) FROM payment_transactions WHERE payment_date BETWEEN ? AND ? AND status = 'completed') as totalRevenue,
        (SELECT COUNT(DISTINCT user_id) FROM enrollments WHERE last_accessed_at BETWEEN ? AND ?) as activeStudents,
        (SELECT COUNT(*) FROM enrollments WHERE completed_at BETWEEN ? AND ?) as courseCompletions,
        (SELECT AVG(rating) FROM course_reviews WHERE created_at BETWEEN ? AND ?) as averageRating,
        (SELECT 
          CASE 
            WHEN COUNT(*) = 0 THEN 0 
            ELSE (COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) / COUNT(*)) * 100 
          END
         FROM enrollments WHERE enrolled_at BETWEEN ? AND ?) as completionRate
    `, [
            startDate, endDate, // totalUsers
            startDate, endDate, // totalCourses
            startDate, endDate, // totalEnrollments
            startDate, endDate, // totalRevenue
            startDate, endDate, // activeStudents
            startDate, endDate, // courseCompletions
            startDate, endDate, // averageRating
            startDate, endDate // completionRate
        ]);
        return {
            totalUsers: stats[0].totalUsers || 0,
            totalCourses: stats[0].totalCourses || 0,
            totalEnrollments: stats[0].totalEnrollments || 0,
            totalRevenue: parseFloat(stats[0].totalRevenue) || 0,
            activeStudents: stats[0].activeStudents || 0,
            courseCompletions: stats[0].courseCompletions || 0,
            averageRating: parseFloat(stats[0].averageRating) || 0,
            completionRate: parseFloat(stats[0].completionRate) || 0
        };
    }
    async getRecentActivities() {
        const [activities] = await this.getDatabase().execute(`
      SELECT 
        al.action,
        al.entity_type,
        al.description,
        al.created_at,
        u.name as user_name,
        u.email as user_email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 20
    `);
        return activities.map((activity) => ({
            action: activity.action,
            entityType: activity.entity_type,
            description: activity.description,
            createdAt: activity.created_at,
            user: activity.user_name ? {
                name: activity.user_name,
                email: activity.user_email
            } : null
        }));
    }
    async getTopCourses(startDate, endDate) {
        const [courses] = await this.getDatabase().execute(`
      SELECT 
        c.id,
        c.title,
        c.thumbnail,
        c.price,
        COUNT(e.id) as enrollments,
        AVG(cr.rating) as rating,
        SUM(pt.amount) as revenue
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.enrolled_at BETWEEN ? AND ?
      LEFT JOIN course_reviews cr ON c.id = cr.course_id
      LEFT JOIN payment_transactions pt ON e.payment_transaction_id = pt.transaction_id AND pt.status = 'completed'
      GROUP BY c.id
      ORDER BY enrollments DESC, revenue DESC
      LIMIT 10
    `, [startDate, endDate]);
        return courses.map((course) => ({
            id: course.id,
            title: course.title,
            thumbnail: course.thumbnail,
            price: parseFloat(course.price),
            enrollments: course.enrollments,
            rating: parseFloat(course.rating) || 0,
            revenue: parseFloat(course.revenue) || 0
        }));
    }
    async getUserGrowthData(startDate, endDate) {
        const [growth] = await this.getDatabase().execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM users
      WHERE created_at BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [startDate, endDate]);
        return growth.map((item) => ({
            date: item.date,
            newUsers: item.new_users
        }));
    }
    async getRevenueData(startDate, endDate) {
        const [revenue] = await this.getDatabase().execute(`
      SELECT 
        DATE(payment_date) as date,
        SUM(amount) as revenue,
        COUNT(*) as transactions
      FROM payment_transactions
      WHERE payment_date BETWEEN ? AND ? AND status = 'completed'
      GROUP BY DATE(payment_date)
      ORDER BY date ASC
    `, [startDate, endDate]);
        return revenue.map((item) => ({
            date: item.date,
            revenue: parseFloat(item.revenue),
            transactions: item.transactions
        }));
    }
    async getRevenueOverTime(startDate, endDate, granularity) {
        let dateFormat = '%Y-%m-%d';
        if (granularity === 'week')
            dateFormat = '%Y-%u';
        if (granularity === 'month')
            dateFormat = '%Y-%m';
        const [revenue] = await this.getDatabase().execute(`
      SELECT 
        DATE_FORMAT(payment_date, ?) as period,
        SUM(amount) as revenue,
        COUNT(*) as transactions
      FROM payment_transactions
      WHERE payment_date BETWEEN ? AND ? AND status = 'completed'
      GROUP BY DATE_FORMAT(payment_date, ?)
      ORDER BY period ASC
    `, [dateFormat, startDate, endDate, dateFormat]);
        return revenue.map((item) => ({
            period: item.period,
            revenue: parseFloat(item.revenue),
            transactions: item.transactions
        }));
    }
    async getRevenueByCourse(startDate, endDate) {
        const [revenue] = await this.getDatabase().execute(`
      SELECT 
        c.id,
        c.title,
        SUM(pt.amount) as revenue,
        COUNT(pt.id) as transactions
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      JOIN payment_transactions pt ON e.payment_transaction_id = pt.transaction_id
      WHERE pt.payment_date BETWEEN ? AND ? AND pt.status = 'completed'
      GROUP BY c.id
      ORDER BY revenue DESC
      LIMIT 20
    `, [startDate, endDate]);
        return revenue.map((item) => ({
            courseId: item.id,
            courseTitle: item.title,
            revenue: parseFloat(item.revenue),
            transactions: item.transactions
        }));
    }
    async getRevenueByPaymentMethod(startDate, endDate) {
        const [revenue] = await this.getDatabase().execute(`
      SELECT 
        payment_method,
        SUM(amount) as revenue,
        COUNT(*) as transactions
      FROM payment_transactions
      WHERE payment_date BETWEEN ? AND ? AND status = 'completed'
      GROUP BY payment_method
      ORDER BY revenue DESC
    `, [startDate, endDate]);
        return revenue.map((item) => ({
            paymentMethod: item.payment_method,
            revenue: parseFloat(item.revenue),
            transactions: item.transactions
        }));
    }
    async getRevenueByInstructor(startDate, endDate) {
        const [revenue] = await this.getDatabase().execute(`
      SELECT 
        u.id,
        u.name,
        SUM(pt.amount) as revenue,
        COUNT(pt.id) as transactions
      FROM users u
      JOIN instructors i ON u.id = i.user_id
      JOIN courses c ON i.id = c.instructor_id
      JOIN enrollments e ON c.id = e.course_id
      JOIN payment_transactions pt ON e.payment_transaction_id = pt.transaction_id
      WHERE pt.payment_date BETWEEN ? AND ? AND pt.status = 'completed'
      GROUP BY u.id
      ORDER BY revenue DESC
      LIMIT 20
    `, [startDate, endDate]);
        return revenue.map((item) => ({
            instructorId: item.id,
            instructorName: item.name,
            revenue: parseFloat(item.revenue),
            transactions: item.transactions
        }));
    }
    async getRefundAnalytics(startDate, endDate) {
        const [refunds] = await this.getDatabase().execute(`
      SELECT 
        COUNT(*) as total_refunds,
        SUM(amount) as total_refund_amount,
        (SELECT COUNT(*) FROM payment_transactions WHERE payment_date BETWEEN ? AND ? AND status = 'completed') as total_transactions,
        (SELECT SUM(amount) FROM payment_transactions WHERE payment_date BETWEEN ? AND ? AND status = 'completed') as total_revenue
      FROM refunds
      WHERE processed_at BETWEEN ? AND ? AND status = 'completed'
    `, [startDate, endDate, startDate, endDate, startDate, endDate]);
        const refund = refunds[0];
        const refundRate = refund.total_transactions > 0 ? (refund.total_refunds / refund.total_transactions) * 100 : 0;
        return {
            totalRefunds: refund.total_refunds || 0,
            totalRefundAmount: parseFloat(refund.total_refund_amount) || 0,
            refundRate: Math.round(refundRate * 100) / 100
        };
    }
    async getTransactionAnalytics(startDate, endDate) {
        const [transactions] = await this.getDatabase().execute(`
      SELECT 
        COUNT(*) as total_transactions,
        AVG(amount) as average_order_value,
        SUM(amount) as total_revenue
      FROM payment_transactions
      WHERE payment_date BETWEEN ? AND ? AND status = 'completed'
    `, [startDate, endDate]);
        const transaction = transactions[0];
        return {
            totalTransactions: transaction.total_transactions || 0,
            averageOrderValue: parseFloat(transaction.average_order_value) || 0,
            totalRevenue: parseFloat(transaction.total_revenue) || 0
        };
    }
    async getUserRegistrationsOverTime(startDate, endDate, granularity) {
        let dateFormat = '%Y-%m-%d';
        if (granularity === 'week')
            dateFormat = '%Y-%u';
        if (granularity === 'month')
            dateFormat = '%Y-%m';
        const [registrations] = await this.getDatabase().execute(`
      SELECT 
        DATE_FORMAT(created_at, ?) as period,
        COUNT(*) as registrations
      FROM users
      WHERE created_at BETWEEN ? AND ?
      GROUP BY DATE_FORMAT(created_at, ?)
      ORDER BY period ASC
    `, [dateFormat, startDate, endDate, dateFormat]);
        return registrations.map((item) => ({
            period: item.period,
            registrations: item.registrations
        }));
    }
    async getUserDemographics() {
        const [demographics] = await this.getDatabase().execute(`
      SELECT 
        r.name as role,
        COUNT(*) as count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      GROUP BY r.name
      ORDER BY count DESC
    `);
        return demographics.map((item) => ({
            role: item.role,
            count: item.count
        }));
    }
    async getUserEngagement(startDate, endDate) {
        const [engagement] = await this.getDatabase().execute(`
      SELECT 
        COUNT(DISTINCT e.user_id) as active_learners,
        AVG(e.progress_percentage) as avg_progress,
        COUNT(CASE WHEN e.last_accessed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as weekly_active,
        COUNT(CASE WHEN e.last_accessed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as monthly_active
      FROM enrollments e
      WHERE e.enrolled_at BETWEEN ? AND ?
    `, [startDate, endDate]);
        return engagement[0];
    }
    async getUserRetention() {
        // Simplified retention calculation
        const [retention] = await this.getDatabase().execute(`
      SELECT 
        DATEDIFF(CURDATE(), u.created_at) as days_since_registration,
        COUNT(CASE WHEN u.last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_users,
        COUNT(*) as total_users
      FROM users u
      WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      GROUP BY FLOOR(DATEDIFF(CURDATE(), u.created_at) / 7)
      ORDER BY days_since_registration
    `);
        return retention.map((item) => ({
            week: Math.floor(item.days_since_registration / 7),
            retentionRate: item.total_users > 0 ? (item.active_users / item.total_users) * 100 : 0
        }));
    }
    async getMostActiveUsers(startDate, endDate) {
        const [users] = await this.getDatabase().execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(e.id) as enrollments,
        COUNT(CASE WHEN e.completed_at IS NOT NULL THEN 1 END) as completions,
        AVG(e.progress_percentage) as avg_progress
      FROM users u
      JOIN enrollments e ON u.id = e.user_id
      WHERE e.enrolled_at BETWEEN ? AND ?
      GROUP BY u.id
      ORDER BY enrollments DESC, completions DESC
      LIMIT 20
    `, [startDate, endDate]);
        return users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            enrollments: user.enrollments,
            completions: user.completions,
            avgProgress: parseFloat(user.avg_progress)
        }));
    }
    async getCoursePerformance(startDate, endDate) {
        const [performance] = await this.getDatabase().execute(`
      SELECT 
        c.id,
        c.title,
        COUNT(e.id) as enrollments,
        COUNT(CASE WHEN e.completed_at IS NOT NULL THEN 1 END) as completions,
        AVG(e.progress_percentage) as avg_progress,
        AVG(cr.rating) as avg_rating,
        SUM(pt.amount) as revenue
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.enrolled_at BETWEEN ? AND ?
      LEFT JOIN course_reviews cr ON c.id = cr.course_id
      LEFT JOIN payment_transactions pt ON e.payment_transaction_id = pt.transaction_id AND pt.status = 'completed'
      GROUP BY c.id
      ORDER BY enrollments DESC
      LIMIT 20
    `, [startDate, endDate]);
        return performance.map((course) => ({
            id: course.id,
            title: course.title,
            enrollments: course.enrollments,
            completions: course.completions,
            completionRate: course.enrollments > 0 ? (course.completions / course.enrollments) * 100 : 0,
            avgProgress: parseFloat(course.avg_progress) || 0,
            avgRating: parseFloat(course.avg_rating) || 0,
            revenue: parseFloat(course.revenue) || 0
        }));
    }
    async getEnrollmentTrends(startDate, endDate) {
        const [trends] = await this.getDatabase().execute(`
      SELECT 
        DATE(enrolled_at) as date,
        COUNT(*) as enrollments
      FROM enrollments
      WHERE enrolled_at BETWEEN ? AND ?
      GROUP BY DATE(enrolled_at)
      ORDER BY date ASC
    `, [startDate, endDate]);
        return trends.map((item) => ({
            date: item.date,
            enrollments: item.enrollments
        }));
    }
    async getCompletionRatesByCourse() {
        const [rates] = await this.getDatabase().execute(`
      SELECT 
        c.id,
        c.title,
        COUNT(e.id) as total_enrollments,
        COUNT(CASE WHEN e.completed_at IS NOT NULL THEN 1 END) as completions,
        (COUNT(CASE WHEN e.completed_at IS NOT NULL THEN 1 END) / COUNT(e.id)) * 100 as completion_rate
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      GROUP BY c.id
      HAVING total_enrollments > 0
      ORDER BY completion_rate DESC
      LIMIT 20
    `);
        return rates.map((course) => ({
            id: course.id,
            title: course.title,
            totalEnrollments: course.total_enrollments,
            completions: course.completions,
            completionRate: parseFloat(course.completion_rate)
        }));
    }
    async getCourseRatingsAnalytics() {
        const [ratings] = await this.getDatabase().execute(`
      SELECT 
        c.id,
        c.title,
        AVG(cr.rating) as avg_rating,
        COUNT(cr.id) as review_count,
        COUNT(CASE WHEN cr.rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN cr.rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN cr.rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN cr.rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN cr.rating = 1 THEN 1 END) as one_star
      FROM courses c
      LEFT JOIN course_reviews cr ON c.id = cr.course_id
      GROUP BY c.id
      HAVING review_count > 0
      ORDER BY avg_rating DESC, review_count DESC
      LIMIT 20
    `);
        return ratings.map((course) => ({
            id: course.id,
            title: course.title,
            avgRating: parseFloat(course.avg_rating),
            reviewCount: course.review_count,
            ratingDistribution: {
                5: course.five_star,
                4: course.four_star,
                3: course.three_star,
                2: course.two_star,
                1: course.one_star
            }
        }));
    }
    async getPopularCourses(startDate, endDate) {
        const [courses] = await this.getDatabase().execute(`
      SELECT 
        c.id,
        c.title,
        c.thumbnail,
        COUNT(e.id) as enrollments,
        AVG(cr.rating) as rating
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.enrolled_at BETWEEN ? AND ?
      LEFT JOIN course_reviews cr ON c.id = cr.course_id
      GROUP BY c.id
      ORDER BY enrollments DESC
      LIMIT 10
    `, [startDate, endDate]);
        return courses.map((course) => ({
            id: course.id,
            title: course.title,
            thumbnail: course.thumbnail,
            enrollments: course.enrollments,
            rating: parseFloat(course.rating) || 0
        }));
    }
    async getCategoryPerformance(startDate, endDate) {
        const [categories] = await this.getDatabase().execute(`
      SELECT 
        cat.id,
        cat.name,
        COUNT(DISTINCT c.id) as course_count,
        COUNT(e.id) as total_enrollments,
        SUM(pt.amount) as revenue
      FROM course_categories cat
      LEFT JOIN courses c ON cat.id = c.category_id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.enrolled_at BETWEEN ? AND ?
      LEFT JOIN payment_transactions pt ON e.payment_transaction_id = pt.transaction_id AND pt.status = 'completed'
      GROUP BY cat.id
      ORDER BY total_enrollments DESC
    `, [startDate, endDate]);
        return categories.map((category) => ({
            id: category.id,
            name: category.name,
            courseCount: category.course_count,
            totalEnrollments: category.total_enrollments,
            revenue: parseFloat(category.revenue) || 0
        }));
    }
    async getExportOverviewData(startDate, endDate) {
        const [data] = await this.getDatabase().execute(`
      SELECT 
        'overview' as report_type,
        ? as start_date,
        ? as end_date,
        (SELECT COUNT(*) FROM users WHERE created_at BETWEEN ? AND ?) as total_users,
        (SELECT COUNT(*) FROM courses WHERE created_at BETWEEN ? AND ?) as total_courses,
        (SELECT COUNT(*) FROM enrollments WHERE enrolled_at BETWEEN ? AND ?) as total_enrollments,
        (SELECT COALESCE(SUM(amount), 0) FROM payment_transactions WHERE payment_date BETWEEN ? AND ? AND status = 'completed') as total_revenue
    `, [startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate]);
        return data[0];
    }
    async getExportRevenueData(startDate, endDate) {
        const [data] = await this.getDatabase().execute(`
      SELECT 
        pt.transaction_id,
        pt.amount,
        pt.currency,
        pt.payment_method,
        pt.payment_date,
        pt.status,
        u.name as user_name,
        u.email as user_email,
        c.title as course_title
      FROM payment_transactions pt
      LEFT JOIN users u ON pt.user_id = u.id
      LEFT JOIN courses c ON pt.course_id = c.id
      WHERE pt.payment_date BETWEEN ? AND ?
      ORDER BY pt.payment_date DESC
    `, [startDate, endDate]);
        return data;
    }
    async getExportUsersData(startDate, endDate) {
        const [data] = await this.getDatabase().execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        r.name as role,
        u.created_at,
        u.last_login,
        u.is_active,
        COUNT(e.id) as total_enrollments,
        COUNT(CASE WHEN e.completed_at IS NOT NULL THEN 1 END) as completed_courses
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN enrollments e ON u.id = e.user_id
      WHERE u.created_at BETWEEN ? AND ?
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `, [startDate, endDate]);
        return data;
    }
    async getExportCoursesData(startDate, endDate) {
        const [data] = await this.getDatabase().execute(`
      SELECT 
        c.id,
        c.title,
        c.price,
        c.level,
        c.is_published,
        c.created_at,
        u.name as instructor_name,
        cat.name as category_name,
        COUNT(e.id) as total_enrollments,
        AVG(cr.rating) as avg_rating
      FROM courses c
      LEFT JOIN instructors i ON c.instructor_id = i.id
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN course_categories cat ON c.category_id = cat.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN course_reviews cr ON c.id = cr.course_id
      WHERE c.created_at BETWEEN ? AND ?
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `, [startDate, endDate]);
        return data;
    }
    convertToCSV(data) {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        const csvRows = data.map(row => headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined)
                return '';
            if (typeof value === 'string' && value.includes(',')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return String(value);
        }).join(','));
        return [csvHeaders, ...csvRows].join('\n');
    }
}
export default AdminAnalyticsController;
//# sourceMappingURL=AdminAnalyticsController.js.map