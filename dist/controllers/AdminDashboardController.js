import { DatabaseError } from '../utils/errors.js';
import { db } from '../config/database.js';
export class AdminDashboardController {
    db;
    constructor(database) {
        this.db = database;
    }
    getDatabase() {
        // Try to get global database instance first
        try {
            const globalDb = db.getPool();
            if (globalDb) {
                console.log('✅ Using global database instance');
                return globalDb;
            }
        }
        catch (e) {
            console.log('⚠️ Global database not available:', e.message);
        }
        if (!this.db) {
            console.log('❌ No database available (this.db is null)');
            throw new DatabaseError('Database not available');
        }
        console.log('✅ Using constructor database instance');
        return this.db;
    }
    checkDatabaseConnection() {
        // Check if we can get database from either source
        try {
            this.getDatabase();
            return true;
        }
        catch (e) {
            console.log('❌ Database connection check failed:', e.message);
            return false;
        }
    }
    /**
     * Get dashboard statistics
     * GET /api/admin/dashboard/stats
     */
    getDashboardStats = async (req, res) => {
        try {
            if (!this.checkDatabaseConnection()) {
                // Import realistic data dynamically
                const { realisticDashboardStats } = await import('../data/realistic-data.js');
                return res.json({
                    success: true,
                    data: realisticDashboardStats,
                    message: "Using realistic mock data - database not connected"
                });
            }
            // Get comprehensive dashboard statistics
            const [stats] = await this.getDatabase().query(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE is_active = 1) as total_users,
          (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_users_30d,
          (SELECT COUNT(*) FROM courses) as total_courses,
          (SELECT COUNT(*) FROM courses WHERE is_published = 1) as published_courses,
          (SELECT COUNT(*) FROM courses WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_courses_30d,
          (SELECT COUNT(*) FROM enrollments WHERE is_active = 1) as total_enrollments,
          (SELECT COUNT(*) FROM enrollments WHERE enrolled_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_enrollments_30d,
          (SELECT SUM(amount) FROM payment_transactions WHERE status = 'completed') as total_revenue,
          (SELECT SUM(amount) FROM payment_transactions WHERE status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as revenue_30d,
          (SELECT COUNT(*) FROM payment_transactions WHERE status = 'completed') as total_transactions,
          (SELECT COUNT(*) FROM payment_transactions WHERE status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as transactions_30d,
          (SELECT AVG(rating) FROM course_reviews) as avg_rating,
          (SELECT COUNT(*) FROM course_reviews WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_reviews_30d
      `);
            const dashboardStats = {
                users: {
                    total: stats[0].total_users,
                    new30d: stats[0].new_users_30d,
                    growth: stats[0].total_users > 0 ? ((stats[0].new_users_30d / stats[0].total_users) * 100).toFixed(1) : 0
                },
                courses: {
                    total: stats[0].total_courses,
                    published: stats[0].published_courses,
                    new30d: stats[0].new_courses_30d,
                    growth: stats[0].total_courses > 0 ? ((stats[0].new_courses_30d / stats[0].total_courses) * 100).toFixed(1) : 0
                },
                enrollments: {
                    total: stats[0].total_enrollments,
                    new30d: stats[0].new_enrollments_30d,
                    growth: stats[0].total_enrollments > 0 ? ((stats[0].new_enrollments_30d / stats[0].total_enrollments) * 100).toFixed(1) : 0
                },
                revenue: {
                    total: parseFloat(stats[0].total_revenue) || 0,
                    month30d: parseFloat(stats[0].revenue_30d) || 0,
                    growth: stats[0].total_revenue > 0 ? (((stats[0].revenue_30d / stats[0].total_revenue) * 100)).toFixed(1) : 0
                },
                transactions: {
                    total: stats[0].total_transactions,
                    new30d: stats[0].transactions_30d,
                    growth: stats[0].total_transactions > 0 ? ((stats[0].transactions_30d / stats[0].total_transactions) * 100).toFixed(1) : 0
                },
                avgRating: parseFloat(stats[0].avg_rating) || 0,
                newReviews30d: stats[0].new_reviews_30d
            };
            res.json({
                success: true,
                data: dashboardStats
            });
        }
        catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch dashboard statistics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    /**
     * Get recent users
     * GET /api/admin/dashboard/recent-users
     */
    getRecentUsers = async (req, res) => {
        try {
            const { limit = 5 } = req.query;
            if (!this.checkDatabaseConnection()) {
                // Import realistic data dynamically
                const { realisticUsers } = await import('../data/realistic-data.js');
                // Sort by creation date and limit
                const recentUsers = realisticUsers
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, Number(limit));
                return res.json({
                    success: true,
                    data: recentUsers,
                    message: "Using realistic mock data - database not connected"
                });
            }
            // MySQL doesn't support parameterized LIMIT in prepared statements, so we use query() instead
            const limitNum = Math.min(Math.max(1, Number(limit)), 100); // Ensure limit is between 1 and 100
            const [users] = await this.getDatabase().query(`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.avatar,
          u.created_at,
          u.last_login,
          u.is_active,
          u.email_verified,
          r.name as role_name,
          (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id AND e.is_active = 1) as enrollment_count
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        ORDER BY u.created_at DESC
        LIMIT ${limitNum}
      `);
            const recentUsers = users.map((user) => ({
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: {
                    name: user.role_name
                },
                createdAt: user.created_at,
                lastLogin: user.last_login,
                isActive: user.is_active,
                emailVerified: user.email_verified,
                stats: {
                    totalEnrollments: user.enrollment_count
                }
            }));
            res.json({
                success: true,
                data: recentUsers
            });
        }
        catch (error) {
            console.error('Get recent users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch recent users',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    /**
     * Get recent courses
     * GET /api/admin/dashboard/recent-courses
     */
    getRecentCourses = async (req, res) => {
        try {
            const { limit = 5 } = req.query;
            if (!this.checkDatabaseConnection()) {
                // Import realistic data dynamically
                const { realisticCourses } = await import('../data/realistic-data.js');
                // Sort by creation date and limit
                const recentCourses = realisticCourses
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, Number(limit));
                return res.json({
                    success: true,
                    data: recentCourses,
                    message: "Using realistic mock data - database not connected"
                });
            }
            // MySQL doesn't support parameterized LIMIT in prepared statements, so we use query() instead
            const limitNum = Math.min(Math.max(1, Number(limit)), 100); // Ensure limit is between 1 and 100
            const [courses] = await this.getDatabase().query(`
        SELECT 
          c.id,
          c.title,
          c.slug,
          c.description,
          c.thumbnail,
          c.price,
          c.currency,
          c.is_published,
          c.created_at,
          c.updated_at,
          i.id as instructor_id,
          u.name as instructor_name,
          u.email as instructor_email,
          u.avatar as instructor_avatar,
          (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.is_active = 1) as enrollment_count,
          (SELECT AVG(rating) FROM course_reviews cr WHERE cr.course_id = c.id) as avg_rating,
          (SELECT COUNT(*) FROM course_reviews cr WHERE cr.course_id = c.id) as review_count
        FROM courses c
        LEFT JOIN instructors i ON c.instructor_id = i.id
        LEFT JOIN users u ON i.user_id = u.id
        ORDER BY c.created_at DESC
        LIMIT ${limitNum}
      `);
            const recentCourses = courses.map((course) => ({
                id: course.id,
                title: course.title,
                slug: course.slug,
                description: course.description,
                thumbnail: course.thumbnail,
                price: parseFloat(course.price),
                currency: course.currency,
                isPublished: course.is_published,
                createdAt: course.created_at,
                updatedAt: course.updated_at,
                instructor: {
                    id: course.instructor_id,
                    name: course.instructor_name,
                    email: course.instructor_email,
                    avatar: course.instructor_avatar
                },
                stats: {
                    activeEnrollments: course.enrollment_count,
                    avgRating: parseFloat(course.avg_rating) || 0,
                    reviewCount: course.review_count
                }
            }));
            res.json({
                success: true,
                data: recentCourses
            });
        }
        catch (error) {
            console.error('Get recent courses error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch recent courses',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    /**
     * Get analytics data
     * GET /api/admin/analytics
     */
    getAnalytics = async (req, res) => {
        try {
            const { period = '30d', startDate, endDate } = req.query;
            if (!this.checkDatabaseConnection()) {
                // Import realistic data dynamically
                const { realisticAnalytics } = await import('../data/realistic-data.js');
                // Return analytics data based on period
                const analyticsData = realisticAnalytics[period] || realisticAnalytics['30d'];
                return res.json({
                    success: true,
                    data: {
                        period,
                        ...analyticsData
                    },
                    message: "Using realistic mock data - database not connected"
                });
            }
            let dateCondition = '';
            let dateParams = [];
            if (startDate && endDate) {
                dateCondition = 'WHERE DATE(created_at) BETWEEN ? AND ?';
                dateParams = [startDate, endDate];
            }
            else {
                // Use period
                switch (period) {
                    case '7d':
                        dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
                        break;
                    case '30d':
                        dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
                        break;
                    case '90d':
                        dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
                        break;
                    case '1y':
                        dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
                        break;
                    default:
                        dateCondition = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
                }
            }
            // Get user registrations over time
            const [userRegistrations] = await this.getDatabase().execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM users
        ${dateCondition}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, dateParams);
            // Get enrollments over time
            const [enrollments] = await this.getDatabase().execute(`
        SELECT 
          DATE(enrolled_at) as date,
          COUNT(*) as count
        FROM enrollments
        ${dateCondition.replace('created_at', 'enrolled_at')}
        GROUP BY DATE(enrolled_at)
        ORDER BY date ASC
      `, dateParams);
            // Get revenue over time
            const [revenue] = await this.getDatabase().execute(`
        SELECT 
          DATE(created_at) as date,
          SUM(amount) as amount
        FROM payment_transactions
        ${dateCondition} AND status = 'completed'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, dateParams);
            // Get course creation over time
            const [courseCreations] = await this.getDatabase().execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM courses
        ${dateCondition}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, dateParams);
            // Get overview stats
            const [overviewStats] = await this.getDatabase().execute(`
        SELECT 
          (SELECT COUNT(*) FROM users) as totalUsers,
          (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as newUsers30d,
          (SELECT COUNT(*) FROM courses WHERE is_published = 1) as totalCourses,
          (SELECT COUNT(*) FROM enrollments) as totalEnrollments,
          (SELECT COALESCE(SUM(amount), 0) FROM payment_transactions WHERE status = 'completed') as totalRevenue,
          (SELECT COUNT(DISTINCT user_id) FROM enrollments WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as activeStudents,
          (SELECT COUNT(*) FROM enrollments WHERE completed_at IS NOT NULL) as courseCompletions,
          (SELECT COALESCE(AVG(rating), 0) FROM course_reviews) as averageRating,
          (SELECT 
            CASE 
              WHEN COUNT(*) = 0 THEN 0 
              ELSE (COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)) 
            END
           FROM enrollments) as completionRate
      `);
            // Get previous period stats for comparison (30 days ago)
            const [previousStats] = await this.getDatabase().execute(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)) as totalUsers,
          (SELECT COUNT(*) FROM courses WHERE is_published = 1 AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)) as totalCourses,
          (SELECT COUNT(*) FROM enrollments WHERE enrolled_at < DATE_SUB(NOW(), INTERVAL 30 DAY)) as totalEnrollments,
          (SELECT COALESCE(SUM(amount), 0) FROM payment_transactions WHERE status = 'completed' AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)) as totalRevenue,
          (SELECT COUNT(DISTINCT user_id) FROM enrollments WHERE updated_at BETWEEN DATE_SUB(NOW(), INTERVAL 37 DAY) AND DATE_SUB(NOW(), INTERVAL 7 DAY)) as activeStudents
      `);
            const calculateChange = (current, previous) => {
                if (previous === 0)
                    return current > 0 ? 100 : 0;
                return Math.round(((current - previous) / previous) * 100);
            };
            const analyticsData = {
                period,
                overview: {
                    totalRevenue: {
                        current: parseFloat(overviewStats[0].totalRevenue || 0),
                        previous: parseFloat(previousStats[0].totalRevenue || 0),
                        change: calculateChange(parseFloat(overviewStats[0].totalRevenue || 0), parseFloat(previousStats[0].totalRevenue || 0))
                    },
                    totalUsers: {
                        current: overviewStats[0].totalUsers || 0,
                        previous: previousStats[0].totalUsers || 0,
                        change: calculateChange(overviewStats[0].totalUsers || 0, previousStats[0].totalUsers || 0)
                    },
                    activeStudents: {
                        current: overviewStats[0].activeStudents || 0,
                        previous: previousStats[0].activeStudents || 0,
                        change: calculateChange(overviewStats[0].activeStudents || 0, previousStats[0].activeStudents || 0)
                    },
                    totalCourses: {
                        current: overviewStats[0].totalCourses || 0,
                        previous: previousStats[0].totalCourses || 0,
                        change: calculateChange(overviewStats[0].totalCourses || 0, previousStats[0].totalCourses || 0)
                    },
                    totalEnrollments: {
                        current: overviewStats[0].totalEnrollments || 0,
                        previous: previousStats[0].totalEnrollments || 0,
                        change: calculateChange(overviewStats[0].totalEnrollments || 0, previousStats[0].totalEnrollments || 0)
                    },
                    courseCompletions: {
                        current: overviewStats[0].courseCompletions || 0,
                        previous: 0,
                        change: 0
                    },
                    averageRating: parseFloat(overviewStats[0].averageRating || 0),
                    completionRate: parseFloat(overviewStats[0].completionRate || 0)
                },
                userGrowth: userRegistrations.map((row) => ({
                    date: row.date,
                    newUsers: row.count
                })),
                revenueData: revenue.map((row) => ({
                    date: row.date,
                    revenue: parseFloat(row.amount)
                })),
                topCourses: [],
                recentActivities: []
            };
            // Get top courses
            try {
                const [topCoursesData] = await this.getDatabase().execute(`
          SELECT 
            c.id,
            c.title,
            COUNT(DISTINCT e.user_id) as enrollments,
            COALESCE(SUM(pt.amount), 0) as revenue,
            COALESCE(AVG(cr.rating), 0) as rating
          FROM courses c
          LEFT JOIN enrollments e ON c.id = e.course_id
          LEFT JOIN payment_transactions pt ON pt.course_id = c.id AND pt.status = 'completed'
          LEFT JOIN course_reviews cr ON c.id = cr.course_id
          WHERE c.is_published = 1
          GROUP BY c.id, c.title
          ORDER BY enrollments DESC
          LIMIT 6
        `);
                analyticsData.topCourses = topCoursesData.map((course) => ({
                    id: course.id,
                    title: course.title,
                    enrollments: course.enrollments || 0,
                    revenue: parseFloat(course.revenue || 0),
                    rating: parseFloat(course.rating || 0)
                }));
            }
            catch (err) {
                console.log('Error fetching top courses:', err);
            }
            res.json({
                success: true,
                data: analyticsData
            });
        }
        catch (error) {
            console.error('Get analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch analytics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
export default AdminDashboardController;
//# sourceMappingURL=AdminDashboardController.js.map