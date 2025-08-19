import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';

export class InstructorDashboardController extends BaseController {
  /**
   * Get instructor dashboard statistics
   */
  async getDashboardStats(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      const range = req.query.range || 'month';
      
      // Get instructor ID from user ID
      const [instructor]: any = await this.getDatabase().query(
        'SELECT id FROM instructors WHERE user_id = ?',
        [userId]
      );

      if (!instructor || instructor.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Instructor profile not found'
        });
      }

      const instructorId = instructor[0].id;

      // Calculate date range
      let dateFilter = '';
      switch(range) {
        case 'week':
          dateFilter = 'DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case 'month':
          dateFilter = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
        case 'year':
          dateFilter = 'DATE_SUB(NOW(), INTERVAL 1 YEAR)';
          break;
        default:
          dateFilter = 'DATE_SUB(NOW(), INTERVAL 30 DAY)';
      }

      // Get comprehensive stats
      const [stats]: any = await this.getDatabase().query(`
        SELECT 
          (SELECT COUNT(*) FROM courses WHERE instructor_id = ?) as totalCourses,
          (SELECT COUNT(*) FROM courses WHERE instructor_id = ? AND is_published = 1) as publishedCourses,
          (SELECT COUNT(DISTINCT e.user_id) 
           FROM enrollments e 
           JOIN courses c ON e.course_id = c.id 
           WHERE c.instructor_id = ? AND e.is_active = 1) as totalStudents,
          (SELECT COALESCE(SUM(pt.amount), 0) 
           FROM payment_transactions pt 
           JOIN courses c ON pt.course_id = c.id 
           WHERE c.instructor_id = ? AND pt.status = 'completed') as totalRevenue,
          (SELECT COALESCE(AVG(r.rating), 0) 
           FROM course_reviews r 
           JOIN courses c ON r.course_id = c.id 
           WHERE c.instructor_id = ?) as averageRating,
          (SELECT COUNT(*) 
           FROM course_reviews r 
           JOIN courses c ON r.course_id = c.id 
           WHERE c.instructor_id = ?) as totalReviews,
          (SELECT COALESCE(SUM(pt.amount), 0) 
           FROM payment_transactions pt 
           JOIN courses c ON pt.course_id = c.id 
           WHERE c.instructor_id = ? AND pt.status = 'completed' 
           AND pt.created_at >= ${dateFilter}) as monthlyEarnings,
          (SELECT COUNT(*) 
           FROM course_reviews r 
           JOIN courses c ON r.course_id = c.id 
           WHERE c.instructor_id = ? AND r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as pendingReviews
      `, [instructorId, instructorId, instructorId, instructorId, instructorId, instructorId, instructorId, instructorId]);

      return res.json({
        success: true,
        data: stats[0]
      });
    } catch (error: any) {
      console.error('Get dashboard stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
        error: error.message
      });
    }
  }

  /**
   * Get recent activity for instructor
   */
  async getRecentActivity(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Get instructor ID
      const [instructor]: any = await this.getDatabase().query(
        'SELECT id FROM instructors WHERE user_id = ?',
        [userId]
      );

      if (!instructor || instructor.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Instructor profile not found'
        });
      }

      const instructorId = instructor[0].id;

      // Get recent activities (enrollments, reviews, completions, questions)
      const [activities]: any = await this.getDatabase().query(`
        (SELECT 
          'enrollment' as type,
          CONCAT('New student enrolled in ', c.title) as message,
          e.enrolled_at as timestamp,
          c.title as courseTitle,
          e.id
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE c.instructor_id = ? AND e.enrolled_at >= DATE_SUB(NOW(), INTERVAL 30 DAY))
        
        UNION ALL
        
        (SELECT 
          'review' as type,
          CONCAT('New ', r.rating, '-star review for ', c.title) as message,
          r.created_at as timestamp,
          c.title as courseTitle,
          r.id
        FROM course_reviews r
        JOIN courses c ON r.course_id = c.id
        WHERE c.instructor_id = ? AND r.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY))
        
        UNION ALL
        
        (SELECT 
          'completion' as type,
          CONCAT('Student completed ', c.title) as message,
          e.completed_at as timestamp,
          c.title as courseTitle,
          e.id
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE c.instructor_id = ? AND e.completed_at IS NOT NULL 
        AND e.completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY))
        
        ORDER BY timestamp DESC
        LIMIT ?
      `, [instructorId, instructorId, instructorId, limit]);

      return res.json({
        success: true,
        data: activities
      });
    } catch (error: any) {
      console.error('Get recent activity error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch recent activity',
        error: error.message
      });
    }
  }

  /**
   * Get course performance metrics
   */
  async getCourseMetrics(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      const courseId = req.params.courseId;
      
      // Get instructor ID and verify ownership
      const [instructor]: any = await this.getDatabase().query(
        'SELECT id FROM instructors WHERE user_id = ?',
        [userId]
      );

      if (!instructor || instructor.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Instructor profile not found'
        });
      }

      const instructorId = instructor[0].id;

      // Verify course ownership
      const [course]: any = await this.getDatabase().query(
        'SELECT * FROM courses WHERE id = ? AND instructor_id = ?',
        [courseId, instructorId]
      );

      if (!course || course.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Course not found or access denied'
        });
      }

      // Get detailed metrics
      const [metrics]: any = await this.getDatabase().query(`
        SELECT 
          COUNT(DISTINCT e.user_id) as totalEnrollments,
          COUNT(DISTINCT CASE WHEN e.progress_percentage >= 50 THEN e.user_id END) as activeStudents,
          COUNT(DISTINCT CASE WHEN e.completed_at IS NOT NULL THEN e.user_id END) as completions,
          AVG(e.progress_percentage) as averageProgress,
          COALESCE(AVG(r.rating), 0) as averageRating,
          COUNT(DISTINCT r.id) as totalReviews,
          COALESCE(SUM(pt.amount), 0) as totalRevenue
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.is_active = 1
        LEFT JOIN course_reviews r ON c.id = r.course_id
        LEFT JOIN payment_transactions pt ON c.id = pt.course_id AND pt.status = 'completed'
        WHERE c.id = ?
      `, [courseId]);

      // Get engagement over time
      const [engagement]: any = await this.getDatabase().query(`
        SELECT 
          DATE(e.enrolled_at) as date,
          COUNT(*) as enrollments
        FROM enrollments e
        WHERE e.course_id = ? AND e.enrolled_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(e.enrolled_at)
        ORDER BY date
      `, [courseId]);

      return res.json({
        success: true,
        data: {
          metrics: metrics[0],
          engagement
        }
      });
    } catch (error: any) {
      console.error('Get course metrics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch course metrics',
        error: error.message
      });
    }
  }

  /**
   * Get student progress for instructor's courses
   */
  async getStudentProgress(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      const { courseId, studentId } = req.query;
      
      // Get instructor ID
      const [instructor]: any = await this.getDatabase().query(
        'SELECT id FROM instructors WHERE user_id = ?',
        [userId]
      );

      if (!instructor || instructor.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Instructor profile not found'
        });
      }

      const instructorId = instructor[0].id;

      let query = `
        SELECT 
          u.id as studentId,
          u.name as studentName,
          u.email as studentEmail,
          c.id as courseId,
          c.title as courseTitle,
          e.enrolled_at,
          e.progress_percentage,
          e.last_accessed,
          e.completed_at,
          cp.completed_lessons,
          cp.total_lessons,
          cp.total_watch_time_seconds
        FROM enrollments e
        JOIN users u ON e.user_id = u.id
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN course_progress cp ON cp.user_id = e.user_id AND cp.course_id = e.course_id
        WHERE c.instructor_id = ? AND e.is_active = 1
      `;

      const params: any[] = [instructorId];

      if (courseId) {
        query += ' AND c.id = ?';
        params.push(courseId);
      }

      if (studentId) {
        query += ' AND u.id = ?';
        params.push(studentId);
      }

      query += ' ORDER BY e.last_accessed DESC';

      const [progress]: any = await this.getDatabase().query(query, params);

      return res.json({
        success: true,
        data: progress
      });
    } catch (error: any) {
      console.error('Get student progress error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch student progress',
        error: error.message
      });
    }
  }
}

export const instructorDashboardController = new InstructorDashboardController();