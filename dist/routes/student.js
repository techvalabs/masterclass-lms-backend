import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { studentController } from '../controllers/StudentController.js';
import { studentDashboardController } from '../controllers/StudentDashboardController.js';
const router = Router();
// All student routes require authentication
router.use(authenticate);
// Original student controller routes
/**
 * @route GET /api/student/enrollments
 * @desc Get student's enrolled courses
 * @access Private
 */
router.get('/enrollments', studentController.getEnrollments.bind(studentController));
/**
 * @route GET /api/student/dashboard
 * @desc Get student dashboard data
 * @access Private
 */
router.get('/dashboard', studentController.getDashboard.bind(studentController));
/**
 * @route GET /api/student/course/:courseId
 * @desc Get course learning content
 * @access Private
 */
router.get('/course/:courseId', studentController.getCourseContent.bind(studentController));
/**
 * @route PUT /api/student/lesson/:lessonId/progress
 * @desc Update lesson progress
 * @access Private
 */
router.put('/lesson/:lessonId/progress', studentController.updateLessonProgress.bind(studentController));
// New dashboard controller routes
/**
 * @route GET /api/student/dashboard/stats
 * @desc Get comprehensive dashboard statistics
 * @access Private
 */
router.get('/dashboard/stats', (req, res) => studentDashboardController.getDashboardStats(req, res));
/**
 * @route GET /api/student/activity/recent
 * @desc Get recent learning activity
 * @access Private
 */
router.get('/activity/recent', (req, res) => studentDashboardController.getRecentActivity(req, res));
/**
 * @route GET /api/student/progress/weekly
 * @desc Get weekly progress data
 * @access Private
 */
router.get('/progress/weekly', (req, res) => studentDashboardController.getWeeklyProgress(req, res));
/**
 * @route GET /api/student/leaderboard
 * @desc Get leaderboard rankings
 * @access Private
 */
router.get('/leaderboard', (req, res) => studentDashboardController.getLeaderboard(req, res));
/**
 * @route PATCH /api/student/courses/:courseId/favorite
 * @desc Toggle course favorite status
 * @access Private
 */
router.patch('/courses/:courseId/favorite', (req, res) => studentDashboardController.toggleCourseFavorite(req, res));
/**
 * @route GET /api/student/courses/recommended
 * @desc Get recommended courses based on learning history
 * @access Private
 */
router.get('/courses/recommended', (req, res) => studentDashboardController.getRecommendedCourses(req, res));
/**
 * @route GET /api/student/streaks
 * @desc Get learning streak data
 * @access Private
 */
router.get('/streaks', (req, res) => studentDashboardController.getLearningStreaks(req, res));
/**
 * @route GET /api/student/achievements
 * @desc Get achievements and badges
 * @access Private
 */
router.get('/achievements', (req, res) => studentDashboardController.getAchievements(req, res));
export default router;
//# sourceMappingURL=student.js.map