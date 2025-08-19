import { Router } from 'express';
import { CourseController } from '@/controllers/CourseController.js';
import { validateBody, validateQuery, validateUuidParam, validatePagination, courseSchemas, optionalAuthMiddleware, requireInstructorOrAdmin, requireAdmin, requireCourseAccess } from '@/middleware/validation.js';
import { authenticate as authMiddleware } from '@/middleware/auth.js';
/**
 * Course Routes
 * Handles course browsing, enrollment, content access, and management
 */
const router = Router();
const courseController = new CourseController();
// Public routes (no authentication required)
// Get all published courses with filtering and pagination (updated for pagination support)
router.get('/', optionalAuthMiddleware, validateQuery(courseSchemas.browse), courseController.getCourses);
// Search courses
router.get('/search', optionalAuthMiddleware, validateQuery(courseSchemas.search), courseController.searchCourses);
// Get featured courses
router.get('/featured', optionalAuthMiddleware, validatePagination, courseController.getFeaturedCourses);
// Get free courses
router.get('/free', optionalAuthMiddleware, validatePagination, courseController.getFreeCourses);
// Get all categories
router.get('/categories', courseController.getCategories);
// Get courses by category
router.get('/category/:categoryId', optionalAuthMiddleware, validateUuidParam('categoryId'), validatePagination, courseController.getCoursesByCategory);
// Get course by ID (public info only for non-enrolled users)
router.get('/:id', optionalAuthMiddleware, validateUuidParam('id'), courseController.getCourseById);
// Get course preview (limited content for non-enrolled users)
router.get('/:id/preview', optionalAuthMiddleware, validateUuidParam('id'), courseController.getCoursePreview);
// Get course modules (public structure only)
router.get('/:id/modules', optionalAuthMiddleware, validateUuidParam('id'), courseController.getCourseModules);
// Get course reviews/ratings
router.get('/:id/reviews', validateUuidParam('id'), validatePagination, courseController.getCourseReviews);
// Protected routes (authentication required)
// Enroll in a course
router.post('/:id/enroll', authMiddleware, validateUuidParam('id'), courseController.enrollInCourse);
// Check enrollment status
router.get('/:id/enrollment', authMiddleware, validateUuidParam('id'), courseController.getEnrollmentStatus);
// Get course content (enrolled users only)
router.get('/:id/content', authMiddleware, validateUuidParam('id'), requireCourseAccess, courseController.getCourseContent);
// Get specific lesson (enrolled users only)
router.get('/:courseId/lessons/:lessonId', authMiddleware, validateUuidParam('courseId'), validateUuidParam('lessonId'), requireCourseAccess, courseController.getLesson);
// Update lesson progress
router.post('/:courseId/lessons/:lessonId/progress', authMiddleware, validateUuidParam('courseId'), validateUuidParam('lessonId'), requireCourseAccess, courseController.updateLessonProgress);
// Get course progress
router.get('/:id/progress', authMiddleware, validateUuidParam('id'), requireCourseAccess, courseController.getCourseProgress);
// Add course rating/review
router.post('/:id/reviews', authMiddleware, validateUuidParam('id'), requireCourseAccess, courseController.addCourseReview);
// Update course rating/review
router.put('/:id/reviews', authMiddleware, validateUuidParam('id'), requireCourseAccess, courseController.updateCourseReview);
// Delete course review
router.delete('/:id/reviews', authMiddleware, validateUuidParam('id'), courseController.deleteCourseReview);
// Get course certificate
router.get('/:id/certificate', authMiddleware, validateUuidParam('id'), requireCourseAccess, courseController.getCertificate);
// Download course resources
router.get('/:courseId/resources/:resourceId', authMiddleware, validateUuidParam('courseId'), validateUuidParam('resourceId'), requireCourseAccess, courseController.downloadResource);
// Course management routes (instructor/admin only)
// Create new course
router.post('/', authMiddleware, requireInstructorOrAdmin, validateBody(courseSchemas.create), courseController.createCourse);
// Analyze videos for pricing suggestions
router.post('/analyze-videos', authMiddleware, requireInstructorOrAdmin, courseController.analyzeVideosForPricing);
// Update course
router.put('/:id', authMiddleware, requireInstructorOrAdmin, validateUuidParam('id'), validateBody(courseSchemas.update), courseController.updateCourse);
// Delete course
router.delete('/:id', authMiddleware, requireInstructorOrAdmin, validateUuidParam('id'), courseController.deleteCourse);
// Publish/unpublish course
router.patch('/:id/publish', authMiddleware, requireInstructorOrAdmin, validateUuidParam('id'), courseController.toggleCoursePublication);
// Get course analytics (instructor/admin only)
router.get('/:id/analytics', authMiddleware, requireInstructorOrAdmin, validateUuidParam('id'), courseController.getCourseAnalytics);
// Get course enrollments (instructor/admin only)
router.get('/:id/enrollments', authMiddleware, requireInstructorOrAdmin, validateUuidParam('id'), validatePagination, courseController.getCourseEnrollments);
// Admin-only routes
// Get all courses (including unpublished)
router.get('/admin/all', authMiddleware, requireAdmin, validatePagination, courseController.getAllCoursesAdmin);
// Feature/unfeature course
router.patch('/:id/feature', authMiddleware, requireAdmin, validateUuidParam('id'), courseController.toggleCourseFeatured);
// Bulk operations
router.post('/admin/bulk-action', authMiddleware, requireAdmin, courseController.bulkCourseAction);
export default router;
//# sourceMappingURL=courses.js.map