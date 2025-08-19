import { Router } from 'express';
import { EnrollmentController } from '../controllers/EnrollmentController.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
const enrollmentController = new EnrollmentController();
// All enrollment routes require authentication
router.use(authenticate);
// Create new enrollment (called after payment)
router.post('/', enrollmentController.createEnrollment.bind(enrollmentController));
// Get user's enrolled courses
router.get('/my-courses', enrollmentController.getMyEnrollments.bind(enrollmentController));
// Get specific course enrollment details
router.get('/course/:courseId', enrollmentController.getCourseEnrollment.bind(enrollmentController));
// Update lesson progress
router.post('/lesson/:lessonId/progress', enrollmentController.updateLessonProgress.bind(enrollmentController));
// Submit quiz attempt
router.post('/quiz/:quizId/submit', enrollmentController.submitQuizAttempt.bind(enrollmentController));
// Get certificate
router.get('/certificate/:courseId', enrollmentController.getCertificate.bind(enrollmentController));
export default router;
//# sourceMappingURL=enrollments.js.map