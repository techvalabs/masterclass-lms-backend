import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';

export class StudentDashboardController extends BaseController {
  /**
   * Get student dashboard statistics
   */
  async getDashboardStats(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      
      // Get comprehensive student stats
      const [stats]: any = await this.getDatabase().query(`
        SELECT 
          (SELECT COUNT(DISTINCT e.course_id) 
           FROM enrollments e 
           WHERE e.user_id = ? AND e.is_active = 1) as totalCourses,
          (SELECT COUNT(DISTINCT e.course_id) 
           FROM enrollments e 
           WHERE e.user_id = ? AND e.status = 'completed') as completedCourses,
          (SELECT COUNT(DISTINCT e.course_id) 
           FROM enrollments e 
           WHERE e.user_id = ? AND e.status = 'active' AND e.progress_percentage > 0) as inProgressCourses,
          (SELECT COALESCE(SUM(cp.total_watch_time_seconds), 0) / 3600
           FROM course_progress cp 
           WHERE cp.user_id = ?) as totalHoursLearned,
          (SELECT COUNT(DISTINCT c.id) 
           FROM certificates c 
           WHERE c.user_id = ?) as certificates,
          (SELECT COALESCE(AVG(cp.progress_percentage), 0) 
           FROM course_progress cp 
           WHERE cp.user_id = ?) as averageProgress,
          (SELECT COALESCE(SUM(lp.time_spent), 0) / 3600
           FROM lesson_progress lp 
           WHERE lp.user_id = ? AND lp.last_watched_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as thisWeekHours,
          (SELECT COALESCE(SUM(up.points), 0) 
           FROM user_points up 
           WHERE up.user_id = ?) as totalPoints
      `, [userId, userId, userId, userId, userId, userId, userId, userId]);

      // Calculate current streak
      const [streakData]: any = await this.getDatabase().query(`
        SELECT 
          COUNT(DISTINCT DATE(lp.last_watched_at)) as activeDays,
          MAX(DATE(lp.last_watched_at)) as lastActiveDate
        FROM lesson_progress lp
        WHERE lp.user_id = ? AND lp.last_watched_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `, [userId]);

      // Simple streak calculation (can be enhanced)
      const lastActive = streakData[0].lastActiveDate;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let currentStreak = 0;
      if (lastActive === today || lastActive === yesterday) {
        // Get consecutive days
        const [streakDays]: any = await this.getDatabase().query(`
          WITH RECURSIVE DateRange AS (
            SELECT DATE(NOW()) as date
            UNION ALL
            SELECT DATE_SUB(date, INTERVAL 1 DAY)
            FROM DateRange
            WHERE date > DATE_SUB(NOW(), INTERVAL 30 DAY)
          )
          SELECT 
            COUNT(*) as streak
          FROM DateRange dr
          WHERE EXISTS (
            SELECT 1 
            FROM lesson_progress lp 
            WHERE lp.user_id = ? 
            AND DATE(lp.last_watched_at) = dr.date
          )
          AND dr.date <= DATE(NOW())
          AND NOT EXISTS (
            SELECT 1 
            FROM DateRange dr2 
            WHERE dr2.date < dr.date 
            AND dr2.date > DATE_SUB(dr.date, INTERVAL 2 DAY)
            AND NOT EXISTS (
              SELECT 1 
              FROM lesson_progress lp2 
              WHERE lp2.user_id = ? 
              AND DATE(lp2.last_watched_at) = dr2.date
            )
          )
        `, [userId, userId]);
        
        currentStreak = streakDays[0]?.streak || 0;
      }

      // Determine rank based on points
      const totalPoints = stats[0].totalPoints || 0;
      let rank = 'Beginner';
      if (totalPoints >= 10000) rank = 'Expert';
      else if (totalPoints >= 5000) rank = 'Advanced';
      else if (totalPoints >= 1000) rank = 'Intermediate';

      return res.json({
        success: true,
        data: {
          ...stats[0],
          currentStreak,
          rank
        }
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
   * Get recent learning activity
   */
  async getRecentActivity(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Get recent activities
      const [activities]: any = await this.getDatabase().query(`
        (SELECT 
          'lesson_completed' as type,
          CONCAT('Completed lesson: ', cl.title) as message,
          lp.last_watched_at as timestamp,
          c.title as courseTitle,
          10 as points,
          lp.lesson_id as id
        FROM lesson_progress lp
        JOIN course_lessons cl ON lp.lesson_id = cl.id
        JOIN courses c ON cl.course_id = c.id
        WHERE lp.user_id = ? AND lp.is_completed = 1 
        AND lp.last_watched_at >= DATE_SUB(NOW(), INTERVAL 30 DAY))
        
        UNION ALL
        
        (SELECT 
          'quiz_passed' as type,
          CONCAT('Passed quiz with ', qa.score, '% score') as message,
          qa.completed_at as timestamp,
          c.title as courseTitle,
          qa.score / 10 as points,
          qa.id
        FROM quiz_attempts qa
        JOIN quizzes q ON qa.quiz_id = q.id
        JOIN course_lessons cl ON q.lesson_id = cl.id
        JOIN courses c ON cl.course_id = c.id
        WHERE qa.user_id = ? AND qa.is_passed = 1
        AND qa.completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY))
        
        UNION ALL
        
        (SELECT 
          'certificate_earned' as type,
          CONCAT('Earned certificate for ', c.title) as message,
          cert.issued_at as timestamp,
          c.title as courseTitle,
          100 as points,
          cert.id
        FROM certificates cert
        JOIN courses c ON cert.course_id = c.id
        WHERE cert.user_id = ?
        AND cert.issued_at >= DATE_SUB(NOW(), INTERVAL 30 DAY))
        
        ORDER BY timestamp DESC
        LIMIT ?
      `, [userId, userId, userId, limit]);

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
   * Get weekly progress data
   */
  async getWeeklyProgress(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      
      // Get last 7 days of progress
      const [progress]: any = await this.getDatabase().query(`
        WITH RECURSIVE last_7_days AS (
          SELECT DATE(NOW()) as date
          UNION ALL
          SELECT DATE_SUB(date, INTERVAL 1 DAY)
          FROM last_7_days
          WHERE date > DATE_SUB(NOW(), INTERVAL 6 DAY)
        )
        SELECT 
          DAYNAME(d.date) as day,
          d.date,
          COALESCE(SUM(lp.time_spent) / 3600, 0) as hoursLearned,
          COUNT(DISTINCT CASE WHEN lp.is_completed = 1 THEN lp.lesson_id END) as lessonsCompleted,
          COALESCE(SUM(CASE WHEN lp.is_completed = 1 THEN 10 ELSE 0 END), 0) as points
        FROM last_7_days d
        LEFT JOIN lesson_progress lp ON DATE(lp.last_watched_at) = d.date AND lp.user_id = ?
        GROUP BY d.date
        ORDER BY d.date
      `, [userId]);

      return res.json({
        success: true,
        data: progress
      });
    } catch (error: any) {
      console.error('Get weekly progress error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch weekly progress',
        error: error.message
      });
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      const range = req.query.range || 'weekly';
      
      let dateFilter = '';
      switch(range) {
        case 'weekly':
          dateFilter = 'AND up.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
          break;
        case 'monthly':
          dateFilter = 'AND up.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
          break;
        case 'all-time':
        default:
          dateFilter = '';
      }

      // Get top students
      const [leaderboard]: any = await this.getDatabase().query(`
        SELECT 
          u.id as userId,
          u.name as userName,
          u.avatar as userAvatar,
          COALESCE(SUM(up.points), 0) as points,
          COUNT(DISTINCT e.course_id) as coursesCompleted,
          GROUP_CONCAT(DISTINCT b.name) as badges,
          RANK() OVER (ORDER BY COALESCE(SUM(up.points), 0) DESC) as position
        FROM users u
        LEFT JOIN user_points up ON u.id = up.user_id ${dateFilter}
        LEFT JOIN enrollments e ON u.id = e.user_id AND e.status = 'completed'
        LEFT JOIN user_badges ub ON u.id = ub.user_id
        LEFT JOIN badges b ON ub.badge_id = b.id
        GROUP BY u.id
        ORDER BY points DESC
        LIMIT 10
      `);

      // Get current user's position
      const [userPosition]: any = await this.getDatabase().query(`
        SELECT 
          COUNT(*) + 1 as position
        FROM (
          SELECT 
            u.id,
            COALESCE(SUM(up.points), 0) as points
          FROM users u
          LEFT JOIN user_points up ON u.id = up.user_id ${dateFilter}
          GROUP BY u.id
        ) as scores
        WHERE scores.points > (
          SELECT COALESCE(SUM(up.points), 0)
          FROM user_points up
          WHERE up.user_id = ? ${dateFilter}
        )
      `, [userId]);

      return res.json({
        success: true,
        data: {
          leaderboard: leaderboard.map((entry: any) => ({
            ...entry,
            badges: entry.badges ? entry.badges.split(',') : []
          })),
          userPosition: userPosition[0].position
        }
      });
    } catch (error: any) {
      console.error('Get leaderboard error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard',
        error: error.message
      });
    }
  }

  /**
   * Toggle course favorite
   */
  async toggleCourseFavorite(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      const { courseId } = req.params;
      
      // Check if already favorited
      const [existing]: any = await this.getDatabase().query(
        'SELECT * FROM user_favorites WHERE user_id = ? AND course_id = ?',
        [userId, courseId]
      );

      let isFavorite = false;
      
      if (existing.length > 0) {
        // Remove favorite
        await this.getDatabase().query(
          'DELETE FROM user_favorites WHERE user_id = ? AND course_id = ?',
          [userId, courseId]
        );
      } else {
        // Add favorite
        await this.getDatabase().query(
          'INSERT INTO user_favorites (user_id, course_id, created_at) VALUES (?, ?, NOW())',
          [userId, courseId]
        );
        isFavorite = true;
      }

      return res.json({
        success: true,
        data: { isFavorite }
      });
    } catch (error: any) {
      console.error('Toggle favorite error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to toggle favorite',
        error: error.message
      });
    }
  }

  /**
   * Get recommended courses
   */
  async getRecommendedCourses(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      
      // Get user's completed courses and categories
      const [userCategories]: any = await this.getDatabase().query(`
        SELECT DISTINCT c.category_id
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = ?
      `, [userId]);

      const categoryIds = userCategories.map((c: any) => c.category_id).filter(Boolean);
      
      // Get recommended courses based on user's learning history
      let query = `
        SELECT 
          c.*,
          u.name as instructor_name,
          COUNT(DISTINCT e.user_id) as total_students,
          COALESCE(AVG(cr.rating), 0) as average_rating
        FROM courses c
        LEFT JOIN instructors i ON c.instructor_id = i.id
        LEFT JOIN users u ON i.user_id = u.id
        LEFT JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN course_reviews cr ON c.id = cr.course_id
        WHERE c.is_published = 1
        AND c.id NOT IN (
          SELECT course_id FROM enrollments WHERE user_id = ?
        )
      `;
      
      const params: any[] = [userId];
      
      if (categoryIds.length > 0) {
        query += ` AND c.category_id IN (${categoryIds.map(() => '?').join(',')})`;
        params.push(...categoryIds);
      }
      
      query += ` GROUP BY c.id
                 ORDER BY average_rating DESC, total_students DESC
                 LIMIT 6`;
      
      const [recommendations]: any = await this.getDatabase().query(query, params);

      return res.json({
        success: true,
        data: recommendations
      });
    } catch (error: any) {
      console.error('Get recommendations error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch recommendations',
        error: error.message
      });
    }
  }

  /**
   * Get learning streaks
   */
  async getLearningStreaks(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      
      // Get last 30 days of activity
      const [streakHistory]: any = await this.getDatabase().query(`
        WITH RECURSIVE last_30_days AS (
          SELECT DATE(NOW()) as date
          UNION ALL
          SELECT DATE_SUB(date, INTERVAL 1 DAY)
          FROM last_30_days
          WHERE date > DATE_SUB(NOW(), INTERVAL 29 DAY)
        )
        SELECT 
          d.date,
          CASE WHEN COUNT(lp.lesson_id) > 0 THEN TRUE ELSE FALSE END as hasActivity
        FROM last_30_days d
        LEFT JOIN lesson_progress lp ON DATE(lp.last_watched_at) = d.date AND lp.user_id = ?
        GROUP BY d.date
        ORDER BY d.date DESC
      `, [userId]);

      // Calculate current streak
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      for (const day of streakHistory) {
        if (day.hasActivity) {
          tempStreak++;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          if (currentStreak === 0 || tempStreak === currentStreak + 1) {
            currentStreak = tempStreak;
          }
        } else {
          if (currentStreak > 0 && tempStreak === currentStreak) {
            // Streak broken
            break;
          }
          tempStreak = 0;
        }
      }

      const lastActivityDate = streakHistory.find((d: any) => d.hasActivity)?.date || null;

      return res.json({
        success: true,
        data: {
          currentStreak,
          longestStreak,
          lastActivityDate,
          streakHistory
        }
      });
    } catch (error: any) {
      console.error('Get learning streaks error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch learning streaks',
        error: error.message
      });
    }
  }

  /**
   * Get achievements and badges
   */
  async getAchievements(req: any, res: Response) {
    try {
      const userId = req.user?.id;
      
      // Get all achievements and user's earned ones
      const [achievements]: any = await this.getDatabase().query(`
        SELECT 
          a.id,
          a.name,
          a.description,
          a.icon,
          a.points_required,
          ub.earned_at as earnedAt,
          CASE 
            WHEN ub.id IS NOT NULL THEN TRUE 
            ELSE FALSE 
          END as isUnlocked,
          CASE 
            WHEN ub.id IS NULL THEN 
              LEAST(100, (
                SELECT COALESCE(SUM(up.points), 0) * 100 / a.points_required
                FROM user_points up
                WHERE up.user_id = ?
              ))
            ELSE 100
          END as progress
        FROM achievements a
        LEFT JOIN user_badges ub ON a.id = ub.badge_id AND ub.user_id = ?
        ORDER BY a.points_required ASC
      `, [userId, userId]);

      return res.json({
        success: true,
        data: achievements
      });
    } catch (error: any) {
      console.error('Get achievements error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch achievements',
        error: error.message
      });
    }
  }
}

export const studentDashboardController = new StudentDashboardController();