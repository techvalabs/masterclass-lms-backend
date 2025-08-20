import { Router } from 'express';
import mysql from 'mysql2/promise';
import { authenticateAdmin } from '../middleware/auth.js';
import { devAuthenticateAdmin } from '../middleware/dev-auth.js';
import AdminCoursesController from '../controllers/AdminCoursesController.js';
import AdminUsersController from '../controllers/AdminUsersController.js';
import AdminAnalyticsController from '../controllers/AdminAnalyticsController.js';
import AdminPaymentsController from '../controllers/AdminPaymentsController.js';
import AdminContentController from '../controllers/AdminContentController.js';
import AdminSettingsController from '../controllers/AdminSettingsController.js';
import AdminDashboardController from '../controllers/AdminDashboardController.js';
import AdminLessonsController from '../controllers/AdminLessonsController.js';

/**
 * Admin Routes Module
 * All routes require admin authentication
 */
export function createAdminRoutes(db: mysql.Pool | null): Router {
  const router = Router();

  // Initialize controllers
  const coursesController = new AdminCoursesController(db);
  const usersController = new AdminUsersController(db);
  const analyticsController = new AdminAnalyticsController(db);
  const paymentsController = new AdminPaymentsController(db);
  const contentController = new AdminContentController(db);
  const settingsController = new AdminSettingsController(db);
  const dashboardController = new AdminDashboardController(db);
  const lessonsController = new AdminLessonsController(db);

  // TEST ENDPOINT - BYPASS AUTH FOR DEBUGGING  
  router.get('/courses-test', (req, res) => coursesController.getCourses(req as any, res));

  // TEST ENDPOINT FOR SETTINGS - NO AUTH REQUIRED
  router.get('/settings-test', (req, res) => settingsController.getSettings(req as any, res));

  // Apply admin authentication to all routes
  router.use(authenticateAdmin);

  // ===========================
  // COURSES MANAGEMENT ROUTES
  // ===========================

  /**
   * @route GET /api/admin/courses
   * @desc Get all courses with admin filters and pagination
   * @access Admin
   */
  // TEST ENDPOINT - BYPASS AUTH FOR DEBUGGING
  router.get('/courses-test', (req, res) => coursesController.getCourses(req as any, res));
  
  router.get('/courses', (req, res) => coursesController.getCourses(req as any, res));

  /**
   * @route POST /api/admin/courses
   * @desc Create new course
   * @access Admin
   */
  router.post('/courses', (req, res) => coursesController.createCourse(req as any, res));

  /**
   * @route GET /api/admin/courses/:id
   * @desc Get course details by ID
   * @access Admin
   */
  router.get('/courses/:id', (req, res) => coursesController.getCourseById(req as any, res));

  /**
   * @route PUT /api/admin/courses/:id
   * @desc Update course
   * @access Admin
   */
  router.put('/courses/:id', (req, res) => coursesController.updateCourse(req as any, res));

  /**
   * @route DELETE /api/admin/courses/:id
   * @desc Delete course
   * @access Admin
   */
  router.delete('/courses/:id', (req, res) => coursesController.deleteCourse(req as any, res));

  /**
   * @route PATCH /api/admin/courses/:id/publish
   * @desc Toggle course publish status
   * @access Admin
   */
  router.patch('/courses/:id/publish', (req, res) => coursesController.togglePublishStatus(req as any, res));

  /**
   * @route POST /api/admin/courses/:id/duplicate
   * @desc Duplicate course
   * @access Admin
   */
  router.post('/courses/:id/duplicate', (req, res) => coursesController.duplicateCourse(req as any, res));

  /**
   * @route POST /api/admin/courses/:id/approve
   * @desc Approve course
   * @access Admin
   */
  router.post('/courses/:id/approve', (req, res) => coursesController.approveCourse(req as any, res));

  /**
   * @route POST /api/admin/courses/:id/reject
   * @desc Reject course
   * @access Admin
   */
  router.post('/courses/:id/reject', (req, res) => coursesController.rejectCourse(req as any, res));

  /**
   * @route POST /api/admin/courses/bulk-action
   * @desc Bulk operations on courses (delete, archive, publish, etc.)
   * @access Admin
   */
  router.post('/courses/bulk-action', (req, res) => coursesController.bulkAction(req as any, res));

  // ===========================
  // LESSONS MANAGEMENT ROUTES
  // ===========================

  /**
   * @route GET /api/admin/courses/:courseId/lessons
   * @desc Get all lessons for a course
   * @access Admin
   */
  router.get('/courses/:courseId/lessons', (req, res) => lessonsController.getLessons(req as any, res));

  /**
   * @route GET /api/admin/courses/:courseId/lessons/:lessonId
   * @desc Get lesson by ID
   * @access Admin
   */
  router.get('/courses/:courseId/lessons/:lessonId', (req, res) => lessonsController.getLessonById(req as any, res));

  /**
   * @route POST /api/admin/courses/:courseId/lessons
   * @desc Create new lesson
   * @access Admin
   */
  router.post('/courses/:courseId/lessons', (req, res) => lessonsController.createLesson(req as any, res));

  /**
   * @route PUT /api/admin/courses/:courseId/lessons/:lessonId
   * @desc Update lesson
   * @access Admin
   */
  router.put('/courses/:courseId/lessons/:lessonId', (req, res) => lessonsController.updateLesson(req as any, res));

  /**
   * @route DELETE /api/admin/courses/:courseId/lessons/:lessonId
   * @desc Delete lesson
   * @access Admin
   */
  router.delete('/courses/:courseId/lessons/:lessonId', (req, res) => lessonsController.deleteLesson(req as any, res));

  /**
   * @route PUT /api/admin/courses/:courseId/lessons/reorder
   * @desc Reorder lessons
   * @access Admin
   */
  router.put('/courses/:courseId/lessons/reorder', (req, res) => lessonsController.reorderLessons(req as any, res));

  /**
   * @route GET /api/admin/lessons/:lessonId/quizzes
   * @desc Get quizzes for a lesson
   * @access Admin
   */
  router.get('/lessons/:lessonId/quizzes', (req, res) => lessonsController.getQuizzes(req as any, res));

  /**
   * @route POST /api/admin/lessons/:lessonId/quizzes
   * @desc Create quiz for a lesson
   * @access Admin
   */
  router.post('/lessons/:lessonId/quizzes', (req, res) => lessonsController.createQuiz(req as any, res));

  /**
   * @route PUT /api/admin/quizzes/:quizId
   * @desc Update quiz
   * @access Admin
   */
  router.put('/quizzes/:quizId', (req, res) => lessonsController.updateQuiz(req as any, res));

  /**
   * @route DELETE /api/admin/quizzes/:quizId
   * @desc Delete quiz
   * @access Admin
   */
  router.delete('/quizzes/:quizId', (req, res) => lessonsController.deleteQuiz(req as any, res));

  // ===========================
  // USERS MANAGEMENT ROUTES
  // ===========================

  /**
   * @route GET /api/admin/users
   * @desc Get all users with admin filters and pagination
   * @access Admin
   */
  router.get('/users', (req, res) => usersController.getUsers(req as any, res));

  /**
   * @route POST /api/admin/users
   * @desc Create a new user
   * @access Admin
   */
  router.post('/users', (req, res) => usersController.createUser(req as any, res));

  /**
   * @route GET /api/admin/users/:id
   * @desc Get user details by ID
   * @access Admin
   */
  router.get('/users/:id', (req, res) => usersController.getUserById(req as any, res));

  /**
   * @route PUT /api/admin/users/:id
   * @desc Update user
   * @access Admin
   */
  router.put('/users/:id', (req, res) => usersController.updateUser(req as any, res));

  /**
   * @route DELETE /api/admin/users/:id
   * @desc Delete user
   * @access Admin
   */
  router.delete('/users/:id', (req, res) => usersController.deleteUser(req as any, res));

  /**
   * @route POST /api/admin/users/:id/change-role
   * @desc Change user role
   * @access Admin
   */
  router.post('/users/:id/change-role', (req, res) => usersController.changeUserRole(req as any, res));

  /**
   * @route POST /api/admin/users/:id/toggle-status
   * @desc Toggle user status (activate/deactivate)
   * @access Admin
   */
  router.post('/users/:id/toggle-status', (req, res) => usersController.toggleUserStatus(req as any, res));

  /**
   * @route GET /api/admin/users/:id/statistics
   * @desc Get user statistics
   * @access Admin
   */
  router.get('/users/:id/statistics', (req, res) => usersController.getUserStatistics(req as any, res));

  /**
   * @route GET /api/admin/users/:id/activity
   * @desc Get user activity history
   * @access Admin
   */
  router.get('/users/:id/activity', (req, res) => usersController.getUserActivity(req as any, res));

  /**
   * @route POST /api/admin/users/:id/send-email
   * @desc Send email to specific user
   * @access Admin
   */
  router.post('/users/:id/send-email', (req, res) => usersController.sendEmailToUser(req as any, res));

  /**
   * @route POST /api/admin/users/bulk-email
   * @desc Send bulk emails to users
   * @access Admin
   */
  router.post('/users/bulk-email', (req, res) => usersController.sendBulkEmail(req as any, res));

  /**
   * @route POST /api/admin/users/bulk-action
   * @desc Bulk operations on users (activate, deactivate, delete, etc.)
   * @access Admin
   */
  router.post('/users/bulk-action', (req, res) => usersController.bulkAction(req as any, res));

  // ===========================
  // ANALYTICS ROUTES
  // ===========================

  /**
   * @route GET /api/admin/analytics/overview
   * @desc Get dashboard overview analytics
   * @access Admin
   */
  router.get('/analytics/overview', (req, res) => analyticsController.getOverview(req as any, res));

  /**
   * @route GET /api/admin/analytics/revenue
   * @desc Get revenue analytics
   * @access Admin
   */
  router.get('/analytics/revenue', (req, res) => analyticsController.getRevenue(req as any, res));

  /**
   * @route GET /api/admin/analytics/users
   * @desc Get user analytics
   * @access Admin
   */
  router.get('/analytics/users', (req, res) => analyticsController.getUsers(req as any, res));

  /**
   * @route GET /api/admin/analytics/courses
   * @desc Get course performance analytics
   * @access Admin
   */
  router.get('/analytics/courses', (req, res) => analyticsController.getCourses(req as any, res));

  /**
   * @route GET /api/admin/analytics/export
   * @desc Export analytics data
   * @access Admin
   */
  router.get('/analytics/export', (req, res) => analyticsController.exportData(req as any, res));

  // ===========================
  // PAYMENTS ROUTES
  // ===========================

  /**
   * @route GET /api/admin/payments/transactions
   * @desc Get transaction history with filters
   * @access Admin
   */
  router.get('/payments/transactions', (req, res) => paymentsController.getTransactions(req as any, res));

  /**
   * @route GET /api/admin/payments/refunds
   * @desc Get refund management data
   * @access Admin
   */
  router.get('/payments/refunds', (req, res) => paymentsController.getRefunds(req as any, res));

  /**
   * @route POST /api/admin/payments/refund
   * @desc Process refund
   * @access Admin
   */
  router.post('/payments/refund', (req, res) => paymentsController.processRefund(req as any, res));

  /**
   * @route GET /api/admin/payments/coupons
   * @desc Get all coupons
   * @access Admin
   */
  router.get('/payments/coupons', (req, res) => paymentsController.getCoupons(req as any, res));

  /**
   * @route POST /api/admin/payments/coupons
   * @desc Create new coupon
   * @access Admin
   */
  router.post('/payments/coupons', (req, res) => paymentsController.createCoupon(req as any, res));

  /**
   * @route PUT /api/admin/payments/coupons/:id
   * @desc Update coupon
   * @access Admin
   */
  router.put('/payments/coupons/:id', (req, res) => paymentsController.updateCoupon(req as any, res));

  /**
   * @route DELETE /api/admin/payments/coupons/:id
   * @desc Delete coupon
   * @access Admin
   */
  router.delete('/payments/coupons/:id', (req, res) => paymentsController.deleteCoupon(req as any, res));

  // ===========================
  // CONTENT UPLOAD ROUTES
  // ===========================

  /**
   * @route POST /api/admin/content/upload
   * @desc File upload (videos, PDFs, images)
   * @access Admin
   */
  router.post('/content/upload', (req, res) => contentController.uploadFiles(req as any, res));

  /**
   * @route GET /api/admin/content/files
   * @desc List uploaded files
   * @access Admin
   */
  router.get('/content/files', (req, res) => contentController.getFiles(req as any, res));

  /**
   * @route GET /api/admin/content/files/:id
   * @desc Get file details by ID
   * @access Admin
   */
  router.get('/content/files/:id', (req, res) => contentController.getFileById(req as any, res));

  /**
   * @route PUT /api/admin/content/files/:id
   * @desc Update file metadata
   * @access Admin
   */
  router.put('/content/files/:id', (req, res) => contentController.updateFile(req as any, res));

  /**
   * @route DELETE /api/admin/content/files/:id
   * @desc Delete file
   * @access Admin
   */
  router.delete('/content/files/:id', (req, res) => contentController.deleteFile(req as any, res));

  /**
   * @route POST /api/admin/content/files/bulk-delete
   * @desc Bulk delete files
   * @access Admin
   */
  router.post('/content/files/bulk-delete', (req, res) => contentController.bulkDeleteFiles(req as any, res));

  // ===========================
  // SETTINGS ROUTES
  // ===========================

  /**
   * @route GET /api/admin/settings
   * @desc Get all system settings
   * @access Admin
   */
  router.get('/settings', (req, res) => settingsController.getSettings(req as any, res));

  /**
   * @route PUT /api/admin/settings/:category
   * @desc Update system settings by category
   * @access Admin
   */
  router.put('/settings/:category', (req, res) => settingsController.updateSettings(req as any, res));

  /**
   * @route GET /api/admin/settings/:category
   * @desc Get settings by category
   * @access Admin
   */
  router.get('/settings/:category', (req, res) => settingsController.getSettings(req as any, res));

  /**
   * @route GET /api/admin/settings/system-info
   * @desc Get system information
   * @access Admin
   */
  router.get('/settings/system-info', (req, res) => settingsController.getSystemInfo(req as any, res));

  /**
   * @route POST /api/admin/settings/backup
   * @desc Create database backup
   * @access Admin
   */
  router.post('/settings/backup', (req, res) => settingsController.createBackup(req as any, res));

  /**
   * @route GET /api/admin/settings/backup/:id
   * @desc Get backup status
   * @access Admin
   */
  router.get('/settings/backup/:id', (req, res) => settingsController.getBackupStatus(req as any, res));

  /**
   * @route GET /api/admin/settings/backups
   * @desc Get all backups
   * @access Admin
   */
  router.get('/settings/backups', (req, res) => settingsController.getBackups(req as any, res));

  /**
   * @route DELETE /api/admin/settings/backup/:id
   * @desc Delete backup
   * @access Admin
   */
  router.delete('/settings/backup/:id', (req, res) => settingsController.deleteBackup(req as any, res));

  /**
   * @route POST /api/admin/settings/clear-cache
   * @desc Clear application cache
   * @access Admin
   */
  router.post('/settings/clear-cache', (req, res) => settingsController.clearCache(req as any, res));

  /**
   * @route POST /api/admin/settings/restore
   * @desc Restore from backup (placeholder)
   * @access Admin
   */
  router.post('/settings/restore', async (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Restore functionality not implemented yet',
      code: 'NOT_IMPLEMENTED'
    });
  });

  // ===========================
  // ADMIN DASHBOARD SUMMARY
  // ===========================

  /**
   * @route GET /api/admin/dashboard
   * @desc Get admin dashboard summary
   * @access Admin
   */
  router.get('/dashboard', async (req, res) => {
    try {
      if (!db) {
        return res.status(503).json({
          success: false,
          message: 'Database not available'
        });
      }
      // Get quick stats for dashboard
      const [stats]: any = await db.execute(`
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_users_30d,
          (SELECT COUNT(*) FROM courses) as total_courses,
          (SELECT COUNT(*) FROM courses WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_courses_30d,
          (SELECT COUNT(*) FROM enrollments) as total_enrollments,
          (SELECT COUNT(*) FROM enrollments WHERE enrolled_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as new_enrollments_30d,
          (SELECT COALESCE(SUM(amount), 0) FROM payment_transactions WHERE status = 'completed') as total_revenue,
          (SELECT COALESCE(SUM(amount), 0) FROM payment_transactions WHERE status = 'completed' AND payment_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as revenue_30d,
          (SELECT COUNT(*) FROM users WHERE is_active = TRUE AND last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as active_users_7d,
          (SELECT COUNT(*) FROM courses WHERE is_published = FALSE) as pending_courses
      `);

      // Get recent activities
      const [activities]: any = await db.execute(`
        SELECT 
          al.action,
          al.description,
          al.created_at,
          u.name as user_name
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 10
      `);

      const dashboardData = {
        stats: {
          users: {
            total: stats[0].total_users,
            new30d: stats[0].new_users_30d,
            active7d: stats[0].active_users_7d
          },
          courses: {
            total: stats[0].total_courses,
            new30d: stats[0].new_courses_30d,
            pending: stats[0].pending_courses
          },
          enrollments: {
            total: stats[0].total_enrollments,
            new30d: stats[0].new_enrollments_30d
          },
          revenue: {
            total: parseFloat(stats[0].total_revenue),
            last30d: parseFloat(stats[0].revenue_30d)
          }
        },
        recentActivities: activities.map((activity: any) => ({
          action: activity.action,
          description: activity.description,
          createdAt: activity.created_at,
          userName: activity.user_name
        }))
      };

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===========================
  // ADMIN PROFILE ROUTES
  // ===========================

  /**
   * @route GET /api/admin/profile
   * @desc Get admin profile
   * @access Admin
   */
  router.get('/profile', async (req: any, res) => {
    try {
      const [users]: any = await db!.execute(
        `SELECT 
          u.id, u.name, u.email, u.avatar, u.phone, u.bio, u.location, u.website,
          u.social_links, u.created_at, u.last_login,
          r.name as role_name, r.permissions
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?`,
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Admin profile not found'
        });
      }

      const user = users[0];

      res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          phone: user.phone,
          bio: user.bio,
          location: user.location,
          website: user.website,
          socialLinks: user.social_links ? JSON.parse(user.social_links) : null,
          role: {
            name: user.role_name,
            permissions: user.permissions ? JSON.parse(user.permissions) : []
          },
          createdAt: user.created_at,
          lastLogin: user.last_login
        }
      });
    } catch (error) {
      console.error('Get admin profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===========================
  // DASHBOARD ROUTES
  // ===========================

  /**
   * @route GET /api/admin/dashboard/stats
   * @desc Get dashboard statistics
   * @access Admin
   */
  router.get('/dashboard/stats', (req, res) => dashboardController.getDashboardStats(req as any, res));

  /**
   * @route GET /api/admin/dashboard/recent-users
   * @desc Get recent users
   * @access Admin
   */
  router.get('/dashboard/recent-users', (req, res) => dashboardController.getRecentUsers(req as any, res));

  /**
   * @route GET /api/admin/dashboard/recent-courses
   * @desc Get recent courses
   * @access Admin
   */
  router.get('/dashboard/recent-courses', (req, res) => dashboardController.getRecentCourses(req as any, res));

  /**
   * @route GET /api/admin/analytics
   * @desc Get analytics data
   * @access Admin
   */
  router.get('/analytics', (req, res) => dashboardController.getAnalytics(req as any, res));

  // ===========================
  // TEST ROUTES (NO AUTH REQUIRED)
  // ===========================
  
  /**
   * @route GET /api/admin/test/database/:tableName
   * @desc Check if database table exists
   * @access Public (for testing)
   */
  router.get('/test/database/:tableName', async (req, res) => {
    try {
      const { tableName } = req.params;
      
      // Sanitize table name
      const allowedTables = [
        'payment_transactions',
        'course_progress',
        'lesson_progress',
        'video_uploads',
        'file_uploads'
      ];
      
      if (!allowedTables.includes(tableName)) {
        return res.status(400).json({ error: 'Invalid table name' });
      }
      
      if (!db) {
        return res.status(503).json({ error: 'Database not available' });
      }
      
      const [result]: any = await db.query(
        `SELECT COUNT(*) as count FROM information_schema.tables 
         WHERE table_schema = DATABASE() AND table_name = ?`,
        [tableName]
      );
      
      const exists = result[0].count > 0;
      
      if (exists) {
        return res.json({ exists: true, tableName });
      } else {
        return res.status(404).json({ exists: false, tableName });
      }
    } catch (error: any) {
      console.error('Test database error:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // ===========================
  // HEALTH CHECK
  // ===========================

  /**
   * @route GET /api/admin/health
   * @desc Admin API health check
   * @access Admin
   */
  router.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Admin API is healthy',
      timestamp: new Date().toISOString(),
      endpoints: {
        courses: '/api/admin/courses',
        users: '/api/admin/users',
        analytics: '/api/admin/analytics',
        payments: '/api/admin/payments',
        content: '/api/admin/content',
        settings: '/api/admin/settings',
        dashboard: '/api/admin/dashboard'
      }
    });
  });

  return router;
}

export default createAdminRoutes;