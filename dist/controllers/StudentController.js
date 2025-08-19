import { BaseController } from './BaseController.js';
export class StudentController extends BaseController {
    /**
     * Get student's enrolled courses
     */
    async getEnrollments(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const [enrollments] = await this.getDatabase().query(`
        SELECT 
          e.id,
          e.enrolled_at,
          e.progress_percentage,
          e.last_accessed as last_accessed_at,
          e.completed_at,
          NULL as certificate_issued_at,
          c.id as course_id,
          c.title,
          c.slug,
          c.description,
          c.thumbnail,
          c.price,
          c.level,
          c.duration_hours,
          c.total_lessons,
          c.rating,
          i.id as instructor_id,
          u.name as instructor_name,
          u.avatar as instructor_avatar,
          COALESCE(cp.completed_lessons, 0) as completed_lessons,
          COALESCE(cp.total_watch_time_seconds, 0) as watch_time
        FROM enrollments e
        INNER JOIN courses c ON e.course_id = c.id
        LEFT JOIN instructors i ON c.instructor_id = i.id
        LEFT JOIN users u ON i.user_id = u.id
        LEFT JOIN course_progress cp ON cp.user_id = e.user_id AND cp.course_id = e.course_id
        WHERE e.user_id = ? AND e.is_active = 1
        ORDER BY e.last_accessed DESC, e.enrolled_at DESC
      `, [userId]);
            return res.json({
                success: true,
                data: enrollments
            });
        }
        catch (error) {
            console.error('Get enrollments error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch enrollments',
                error: error.message
            });
        }
    }
    /**
     * Get course learning content
     */
    async getCourseContent(req, res) {
        try {
            const { courseId } = req.params;
            const userId = req.user?.id;
            // Check enrollment
            const [enrollment] = await this.getDatabase().query('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ? AND is_active = 1', [userId, courseId]);
            if (!enrollment || enrollment.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not enrolled in this course'
                });
            }
            // Get course with modules and lessons
            const [course] = await this.getDatabase().query(`
        SELECT 
          c.*,
          i.bio as instructor_bio,
          u.name as instructor_name,
          u.avatar as instructor_avatar
        FROM courses c
        LEFT JOIN instructors i ON c.instructor_id = i.id
        LEFT JOIN users u ON i.user_id = u.id
        WHERE c.id = ?
      `, [courseId]);
            if (!course || course.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }
            // Get modules
            const [modules] = await this.getDatabase().query(`
        SELECT * FROM modules 
        WHERE course_id = ? AND is_published = 1
        ORDER BY sort_order
      `, [courseId]);
            // Get lessons for each module
            for (const module of modules) {
                const [lessons] = await this.getDatabase().query(`
          SELECT 
            l.*,
            COALESCE(lp.is_completed, 0) as is_completed,
            COALESCE(lp.watch_percentage, 0) as watch_percentage,
            COALESCE(lp.last_position_seconds, 0) as last_position
          FROM lessons l
          LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ?
          WHERE l.module_id = ? AND l.is_published = 1
          ORDER BY l.sort_order
        `, [userId, module.id]);
                module.lessons = lessons;
            }
            // Get user's progress
            const [progress] = await this.getDatabase().query(`
        SELECT * FROM course_progress 
        WHERE user_id = ? AND course_id = ?
      `, [userId, courseId]);
            return res.json({
                success: true,
                data: {
                    course: course[0],
                    modules,
                    progress: progress[0] || null,
                    enrollment: enrollment[0]
                }
            });
        }
        catch (error) {
            console.error('Get course content error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch course content',
                error: error.message
            });
        }
    }
    /**
     * Update lesson progress
     */
    async updateLessonProgress(req, res) {
        try {
            const { lessonId } = req.params;
            const userId = req.user?.id;
            const { watchTime, watchPercentage, lastPosition, isCompleted } = req.body;
            // Get lesson details
            const [lesson] = await this.getDatabase().query('SELECT l.*, m.course_id FROM lessons l JOIN modules m ON l.module_id = m.id WHERE l.id = ?', [lessonId]);
            if (!lesson || lesson.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Lesson not found'
                });
            }
            const courseId = lesson[0].course_id;
            const moduleId = lesson[0].module_id;
            // Check enrollment
            const [enrollment] = await this.getDatabase().query('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ? AND is_active = 1', [userId, courseId]);
            if (!enrollment || enrollment.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not enrolled in this course'
                });
            }
            // Update or insert lesson progress
            await this.getDatabase().query(`
        INSERT INTO lesson_progress (
          user_id, course_id, lesson_id, module_id,
          video_progress_seconds, watch_percentage, 
          last_position_seconds, is_completed, 
          completed_at, last_watched_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          video_progress_seconds = VALUES(video_progress_seconds),
          watch_percentage = VALUES(watch_percentage),
          last_position_seconds = VALUES(last_position_seconds),
          is_completed = VALUES(is_completed),
          completed_at = IF(VALUES(is_completed) = 1 AND completed_at IS NULL, NOW(), completed_at),
          last_watched_at = NOW()
      `, [
                userId, courseId, lessonId, moduleId,
                watchTime || 0, watchPercentage || 0,
                lastPosition || 0, isCompleted ? 1 : 0,
                isCompleted ? new Date() : null
            ]);
            // Update course progress
            await this.updateCourseProgress(userId, courseId);
            return res.json({
                success: true,
                message: 'Progress updated successfully'
            });
        }
        catch (error) {
            console.error('Update lesson progress error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update progress',
                error: error.message
            });
        }
    }
    /**
     * Update overall course progress
     */
    async updateCourseProgress(userId, courseId) {
        try {
            // Get total lessons and completed lessons
            const [stats] = await this.getDatabase().query(`
        SELECT 
          COUNT(DISTINCT l.id) as total_lessons,
          COUNT(DISTINCT CASE WHEN lp.is_completed = 1 THEN l.id END) as completed_lessons,
          COUNT(DISTINCT m.id) as total_modules,
          SUM(lp.video_progress_seconds) as total_watch_time
        FROM modules m
        JOIN lessons l ON l.module_id = m.id
        LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = ?
        WHERE m.course_id = ? AND l.is_published = 1
      `, [userId, courseId]);
            const progressPercentage = stats[0].total_lessons > 0
                ? (stats[0].completed_lessons / stats[0].total_lessons) * 100
                : 0;
            // Get enrollment ID
            const [enrollment] = await this.getDatabase().query('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);
            // Update or insert course progress
            await this.getDatabase().query(`
        INSERT INTO course_progress (
          user_id, course_id, enrollment_id,
          completed_lessons, total_lessons,
          total_modules, progress_percentage,
          total_watch_time_seconds, last_accessed_at,
          is_completed, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
        ON DUPLICATE KEY UPDATE
          completed_lessons = VALUES(completed_lessons),
          total_lessons = VALUES(total_lessons),
          progress_percentage = VALUES(progress_percentage),
          total_watch_time_seconds = VALUES(total_watch_time_seconds),
          last_accessed_at = NOW(),
          is_completed = VALUES(is_completed),
          completed_at = IF(VALUES(is_completed) = 1 AND completed_at IS NULL, NOW(), completed_at)
      `, [
                userId, courseId, enrollment[0].id,
                stats[0].completed_lessons, stats[0].total_lessons,
                stats[0].total_modules, progressPercentage,
                stats[0].total_watch_time || 0,
                progressPercentage >= 100 ? 1 : 0,
                progressPercentage >= 100 ? new Date() : null
            ]);
            // Update enrollment progress
            await this.getDatabase().query('UPDATE enrollments SET progress_percentage = ?, last_accessed = NOW() WHERE user_id = ? AND course_id = ?', [progressPercentage, userId, courseId]);
        }
        catch (error) {
            console.error('Update course progress error:', error);
        }
    }
    /**
     * Get student dashboard data
     */
    async getDashboard(req, res) {
        try {
            const userId = req.user?.id;
            // Get enrolled courses with progress
            const [courses] = await this.getDatabase().query(`
        SELECT 
          c.id, c.title, c.thumbnail, c.total_lessons,
          e.enrolled_at, e.progress_percentage,
          cp.completed_lessons, cp.last_accessed_at
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN course_progress cp ON cp.course_id = c.id AND cp.user_id = e.user_id
        WHERE e.user_id = ? AND e.is_active = 1
        ORDER BY cp.last_accessed_at DESC, e.enrolled_at DESC
        LIMIT 6
      `, [userId]);
            // Get learning stats
            const [stats] = await this.getDatabase().query(`
        SELECT 
          COUNT(DISTINCT e.course_id) as total_courses,
          COUNT(DISTINCT CASE WHEN e.completed_at IS NOT NULL THEN e.course_id END) as completed_courses,
          COALESCE(SUM(cp.total_watch_time_seconds) / 3600, 0) as total_hours,
          COUNT(DISTINCT lp.lesson_id) as total_lessons_completed
        FROM enrollments e
        LEFT JOIN course_progress cp ON cp.course_id = e.course_id AND cp.user_id = e.user_id
        LEFT JOIN lesson_progress lp ON lp.user_id = e.user_id AND lp.is_completed = 1
        WHERE e.user_id = ?
      `, [userId]);
            // Get recent activity
            const [activity] = await this.getDatabase().query(`
        SELECT 
          l.title as lesson_title,
          c.title as course_title,
          lp.last_watched_at,
          lp.watch_percentage
        FROM lesson_progress lp
        JOIN lessons l ON lp.lesson_id = l.id
        JOIN modules m ON l.module_id = m.id
        JOIN courses c ON m.course_id = c.id
        WHERE lp.user_id = ?
        ORDER BY lp.last_watched_at DESC
        LIMIT 5
      `, [userId]);
            return res.json({
                success: true,
                data: {
                    courses,
                    stats: stats[0],
                    recentActivity: activity
                }
            });
        }
        catch (error) {
            console.error('Get dashboard error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch dashboard data',
                error: error.message
            });
        }
    }
}
export const studentController = new StudentController();
//# sourceMappingURL=StudentController.js.map