import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { BaseController } from '../controllers/BaseController.js';
import { instructorDashboardController } from '../controllers/InstructorDashboardController.js';
const router = Router();
// All instructor routes require authentication and instructor role
router.use(authenticate);
router.use(authorizeRoles('instructor', 'admin'));
class InstructorController extends BaseController {
    async getCourses(req, res) {
        try {
            const userId = req.user?.id;
            // Get instructor ID from user ID
            const [instructor] = await this.getDatabase().query('SELECT id FROM instructors WHERE user_id = ?', [userId]);
            if (!instructor || instructor.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Instructor profile not found'
                });
            }
            const instructorId = instructor[0].id;
            // Get instructor's courses
            const [courses] = await this.getDatabase().query(`
        SELECT 
          c.*,
          COUNT(DISTINCT e.id) as total_students,
          COUNT(DISTINCT r.id) as total_reviews,
          AVG(r.rating) as average_rating,
          COUNT(DISTINCT pt.id) * c.price as total_revenue
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.is_active = 1
        LEFT JOIN course_reviews r ON c.id = r.course_id
        LEFT JOIN payment_transactions pt ON c.id = pt.course_id AND pt.status = 'completed'
        WHERE c.instructor_id = ?
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `, [instructorId]);
            return res.json({
                success: true,
                data: courses
            });
        }
        catch (error) {
            console.error('Get instructor courses error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch courses',
                error: error.message
            });
        }
    }
    async getAnalytics(req, res) {
        try {
            const userId = req.user?.id;
            // Get instructor ID
            const [instructor] = await this.getDatabase().query('SELECT id FROM instructors WHERE user_id = ?', [userId]);
            if (!instructor || instructor.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Instructor profile not found'
                });
            }
            const instructorId = instructor[0].id;
            // Get analytics data
            const [stats] = await this.getDatabase().query(`
        SELECT 
          COUNT(DISTINCT c.id) as total_courses,
          COUNT(DISTINCT e.id) as total_students,
          COUNT(DISTINCT r.id) as total_reviews,
          AVG(r.rating) as average_rating,
          COALESCE(SUM(pt.amount), 0) as total_revenue,
          COUNT(DISTINCT CASE WHEN c.is_published = 1 THEN c.id END) as published_courses
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.is_active = 1
        LEFT JOIN course_reviews r ON c.id = r.course_id
        LEFT JOIN payment_transactions pt ON c.id = pt.course_id AND pt.status = 'completed'
        WHERE c.instructor_id = ?
      `, [instructorId]);
            return res.json({
                success: true,
                data: stats[0]
            });
        }
        catch (error) {
            console.error('Get instructor analytics error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch analytics',
                error: error.message
            });
        }
    }
    async getReviews(req, res) {
        try {
            const userId = req.user?.id;
            // Get instructor ID
            const [instructor] = await this.getDatabase().query('SELECT id FROM instructors WHERE user_id = ?', [userId]);
            if (!instructor || instructor.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Instructor profile not found'
                });
            }
            const instructorId = instructor[0].id;
            // Get reviews for instructor's courses
            const [reviews] = await this.getDatabase().query(`
        SELECT 
          r.*,
          c.title as course_title,
          u.name as reviewer_name,
          u.avatar as reviewer_avatar
        FROM course_reviews r
        JOIN courses c ON r.course_id = c.id
        JOIN users u ON r.user_id = u.id
        WHERE c.instructor_id = ?
        ORDER BY r.created_at DESC
        LIMIT 50
      `, [instructorId]);
            return res.json({
                success: true,
                data: reviews
            });
        }
        catch (error) {
            console.error('Get instructor reviews error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch reviews',
                error: error.message
            });
        }
    }
    async getRevenue(req, res) {
        try {
            const userId = req.user?.id;
            // Get instructor ID
            const [instructor] = await this.getDatabase().query('SELECT id FROM instructors WHERE user_id = ?', [userId]);
            if (!instructor || instructor.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Instructor profile not found'
                });
            }
            const instructorId = instructor[0].id;
            // Get revenue data
            const [revenue] = await this.getDatabase().query(`
        SELECT 
          DATE_FORMAT(pt.created_at, '%Y-%m') as month,
          COUNT(DISTINCT e.id) as enrollments,
          SUM(pt.amount) as revenue,
          c.title as course_title,
          c.id as course_id
        FROM payment_transactions pt
        JOIN courses c ON pt.course_id = c.id
        LEFT JOIN enrollments e ON e.course_id = c.id AND e.user_id = pt.user_id
        WHERE c.instructor_id = ? AND pt.status = 'completed'
        GROUP BY month, c.id
        ORDER BY month DESC
        LIMIT 12
      `, [instructorId]);
            // Get total revenue
            const [totals] = await this.getDatabase().query(`
        SELECT 
          SUM(pt.amount) as total_revenue,
          COUNT(DISTINCT pt.id) as total_sales,
          AVG(pt.amount) as average_sale
        FROM payment_transactions pt
        JOIN courses c ON pt.course_id = c.id
        WHERE c.instructor_id = ? AND pt.status = 'completed'
      `, [instructorId]);
            return res.json({
                success: true,
                data: {
                    monthly: revenue,
                    totals: totals[0]
                }
            });
        }
        catch (error) {
            console.error('Get instructor revenue error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch revenue data',
                error: error.message
            });
        }
    }
}
const controller = new InstructorController();
// Instructor routes
router.get('/courses', (req, res) => controller.getCourses(req, res));
router.get('/analytics', (req, res) => controller.getAnalytics(req, res));
router.get('/reviews', (req, res) => controller.getReviews(req, res));
router.get('/revenue', (req, res) => controller.getRevenue(req, res));
// Dashboard routes
router.get('/dashboard/stats', (req, res) => instructorDashboardController.getDashboardStats(req, res));
router.get('/activity/recent', (req, res) => instructorDashboardController.getRecentActivity(req, res));
router.get('/courses/:courseId/metrics', (req, res) => instructorDashboardController.getCourseMetrics(req, res));
router.get('/students/progress', (req, res) => instructorDashboardController.getStudentProgress(req, res));
export default router;
//# sourceMappingURL=instructor.js.map