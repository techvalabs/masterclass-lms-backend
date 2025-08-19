import { BaseController } from './BaseController.js';
export class EnrollmentController extends BaseController {
    // Create new enrollment (usually called after payment)
    async createEnrollment(req, res) {
        const db = this.getDatabase();
        try {
            const userId = req.userId;
            const { course_id } = req.body;
            if (!course_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Course ID is required'
                });
            }
            // Check if already enrolled
            const [existingEnrollment] = await db.execute('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, course_id]);
            if (existingEnrollment.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Already enrolled in this course'
                });
            }
            // Check if course exists and is published
            const [courses] = await db.execute('SELECT id, title, is_published FROM courses WHERE id = ?', [course_id]);
            if (courses.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }
            if (!courses[0].is_published) {
                return res.status(400).json({
                    success: false,
                    message: 'Course is not available for enrollment'
                });
            }
            await db.query('START TRANSACTION');
            // Create enrollment
            const [enrollmentResult] = await db.execute(`INSERT INTO enrollments 
         (user_id, course_id, status, payment_status, enrolled_at, created_at) 
         VALUES (?, ?, 'active', 'paid', NOW(), NOW())`, [userId, course_id]);
            // Create course progress
            await db.execute(`INSERT INTO course_progress 
         (user_id, course_id, enrollment_id, progress_percentage, last_accessed_at, created_at) 
         VALUES (?, ?, ?, 0, NOW(), NOW())
         ON DUPLICATE KEY UPDATE updated_at = NOW()`, [userId, course_id, enrollmentResult.insertId]);
            // Update course stats
            await db.execute(`UPDATE courses 
         SET total_students = total_students + 1 
         WHERE id = ?`, [course_id]);
            await db.query('COMMIT');
            res.json({
                success: true,
                message: 'Enrollment created successfully',
                enrollment_id: enrollmentResult.insertId
            });
        }
        catch (error) {
            await db.query('ROLLBACK');
            console.error('Error creating enrollment:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create enrollment',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get user's enrolled courses
    async getMyEnrollments(req, res) {
        try {
            const userId = req.userId;
            const { status = 'active', page = 1, limit = 10 } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            const limitNum = Math.min(Math.max(1, Number(limit)), 50);
            const [enrollments] = await this.getDatabase().query(`SELECT 
          e.*,
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
          cp.progress_percentage,
          cp.completed_lessons,
          cp.last_accessed_at,
          cp.completed_at,
          i.name as instructor_name
         FROM enrollments e
         JOIN courses c ON e.course_id = c.id
         LEFT JOIN course_progress cp ON e.user_id = cp.user_id AND e.course_id = cp.course_id
         LEFT JOIN instructors ins ON c.instructor_id = ins.id
         LEFT JOIN users i ON ins.user_id = i.id
         WHERE e.user_id = ? ${status !== 'all' ? 'AND e.status = ?' : ''}
         ORDER BY e.enrolled_at DESC
         LIMIT ${limitNum} OFFSET ${offset}`, status !== 'all' ? [userId, status] : [userId]);
            const [countResult] = await this.getDatabase().execute(`SELECT COUNT(*) as total 
         FROM enrollments 
         WHERE user_id = ? ${status !== 'all' ? 'AND status = ?' : ''}`, status !== 'all' ? [userId, status] : [userId]);
            res.json({
                success: true,
                data: {
                    enrollments,
                    pagination: {
                        page: Number(page),
                        limit: limitNum,
                        total: countResult[0].total,
                        pages: Math.ceil(countResult[0].total / limitNum)
                    }
                }
            });
        }
        catch (error) {
            console.error('Get enrollments error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch enrollments'
            });
        }
    }
    // Get course enrollment details
    async getCourseEnrollment(req, res) {
        try {
            const userId = req.userId;
            const { courseId } = req.params;
            const [enrollment] = await this.getDatabase().execute(`SELECT 
          e.*,
          cp.progress_percentage,
          cp.completed_lessons,
          cp.total_time_spent,
          cp.last_lesson_id,
          cp.last_accessed_at
         FROM enrollments e
         LEFT JOIN course_progress cp ON e.user_id = cp.user_id AND e.course_id = cp.course_id
         WHERE e.user_id = ? AND e.course_id = ?`, [userId, courseId]);
            if (enrollment.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Not enrolled in this course'
                });
            }
            // Get lesson progress
            const [lessonProgress] = await this.getDatabase().execute(`SELECT 
          lp.*,
          cl.title as lesson_title,
          cl.sort_order
         FROM lesson_progress lp
         JOIN course_lessons cl ON lp.lesson_id = cl.id
         WHERE lp.user_id = ? AND cl.course_id = ?
         ORDER BY cl.sort_order`, [userId, courseId]);
            res.json({
                success: true,
                data: {
                    enrollment: enrollment[0],
                    lessonProgress
                }
            });
        }
        catch (error) {
            console.error('Get course enrollment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch enrollment details'
            });
        }
    }
    // Update lesson progress
    async updateLessonProgress(req, res) {
        try {
            const userId = req.userId;
            const { lessonId } = req.params;
            const { videoProgress = 0, isCompleted = false, timeSpent = 0, notes = null } = req.body;
            // Verify enrollment
            const [lesson] = await this.getDatabase().execute('SELECT course_id FROM course_lessons WHERE id = ?', [lessonId]);
            if (lesson.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Lesson not found'
                });
            }
            const courseId = lesson[0].course_id;
            const [enrollment] = await this.getDatabase().execute('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ? AND status = "active"', [userId, courseId]);
            if (enrollment.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Not enrolled in this course'
                });
            }
            const db = this.getDatabase();
            await db.query('START TRANSACTION');
            try {
                // Update or insert lesson progress
                await db.execute(`INSERT INTO lesson_progress 
           (user_id, lesson_id, video_progress, is_completed, time_spent, notes, last_watched_at, created_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE
           video_progress = VALUES(video_progress),
           is_completed = VALUES(is_completed),
           time_spent = time_spent + VALUES(time_spent),
           notes = VALUES(notes),
           last_watched_at = NOW()`, [userId, lessonId, videoProgress, isCompleted, timeSpent, notes]);
                // Update course progress
                const [totalLessons] = await db.execute('SELECT COUNT(*) as total FROM course_lessons WHERE course_id = ?', [courseId]);
                const [completedLessons] = await db.execute(`SELECT COUNT(*) as completed 
           FROM lesson_progress lp
           JOIN course_lessons cl ON lp.lesson_id = cl.id
           WHERE lp.user_id = ? AND cl.course_id = ? AND lp.is_completed = 1`, [userId, courseId]);
                const progressPercentage = Math.round((completedLessons[0].completed / totalLessons[0].total) * 100);
                const isCourseCompleted = progressPercentage === 100;
                await db.execute(`INSERT INTO course_progress 
           (user_id, course_id, progress_percentage, completed_lessons, last_lesson_id, last_accessed_at, completed_at, created_at)
           VALUES (?, ?, ?, ?, ?, NOW(), ?, NOW())
           ON DUPLICATE KEY UPDATE
           progress_percentage = VALUES(progress_percentage),
           completed_lessons = VALUES(completed_lessons),
           last_lesson_id = VALUES(last_lesson_id),
           last_accessed_at = NOW(),
           completed_at = VALUES(completed_at),
           total_time_spent = total_time_spent + ?`, [
                    userId,
                    courseId,
                    progressPercentage,
                    completedLessons[0].completed,
                    lessonId,
                    isCourseCompleted ? new Date() : null,
                    timeSpent
                ]);
                // Update enrollment if course completed
                if (isCourseCompleted) {
                    await db.execute(`UPDATE enrollments 
             SET status = 'completed', completed_at = NOW() 
             WHERE user_id = ? AND course_id = ?`, [userId, courseId]);
                }
                await db.query('COMMIT');
                res.json({
                    success: true,
                    data: {
                        lessonProgress: {
                            lessonId,
                            videoProgress,
                            isCompleted,
                            timeSpent
                        },
                        courseProgress: {
                            progressPercentage,
                            completedLessons: completedLessons[0].completed,
                            totalLessons: totalLessons[0].total,
                            isCompleted: isCourseCompleted
                        }
                    }
                });
            }
            catch (error) {
                await db.query('ROLLBACK');
                throw error;
            }
        }
        catch (error) {
            console.error('Update lesson progress error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update progress'
            });
        }
    }
    // Mark quiz as completed
    async submitQuizAttempt(req, res) {
        try {
            const userId = req.userId;
            const { quizId } = req.params;
            const { answers, timeSpent } = req.body;
            // Get quiz and correct answers
            const [quiz] = await this.getDatabase().execute(`SELECT 
          q.*,
          cl.course_id
         FROM quizzes q
         JOIN course_lessons cl ON q.lesson_id = cl.id
         WHERE q.id = ?`, [quizId]);
            if (quiz.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }
            // Verify enrollment
            const [enrollment] = await this.getDatabase().execute('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ? AND status = "active"', [userId, quiz[0].course_id]);
            if (enrollment.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Not enrolled in this course'
                });
            }
            // Get quiz questions
            const [questions] = await this.getDatabase().execute('SELECT * FROM quiz_questions WHERE quiz_id = ?', [quizId]);
            // Calculate score
            let correctAnswers = 0;
            const results = [];
            for (const question of questions) {
                const userAnswer = answers[question.id];
                const isCorrect = userAnswer === question.correct_answer;
                if (isCorrect)
                    correctAnswers++;
                results.push({
                    questionId: question.id,
                    userAnswer,
                    correctAnswer: question.correct_answer,
                    isCorrect
                });
            }
            const score = Math.round((correctAnswers / questions.length) * 100);
            const isPassed = score >= (quiz[0].passing_score || 70);
            // Save quiz attempt
            const [result] = await this.getDatabase().execute(`INSERT INTO quiz_attempts 
         (user_id, quiz_id, score, is_passed, answers, time_spent, completed_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
                userId,
                quizId,
                score,
                isPassed,
                JSON.stringify(results),
                timeSpent
            ]);
            res.json({
                success: true,
                data: {
                    attemptId: result.insertId,
                    score,
                    isPassed,
                    correctAnswers,
                    totalQuestions: questions.length,
                    results
                }
            });
        }
        catch (error) {
            console.error('Submit quiz error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit quiz'
            });
        }
    }
    // Get certificate if course completed
    async getCertificate(req, res) {
        try {
            const userId = req.userId;
            const { courseId } = req.params;
            // Check if course is completed
            const [enrollment] = await this.getDatabase().execute(`SELECT 
          e.*,
          u.name as user_name,
          c.title as course_title,
          cp.completed_at
         FROM enrollments e
         JOIN users u ON e.user_id = u.id
         JOIN courses c ON e.course_id = c.id
         JOIN course_progress cp ON e.user_id = cp.user_id AND e.course_id = cp.course_id
         WHERE e.user_id = ? AND e.course_id = ? AND e.status = 'completed'`, [userId, courseId]);
            if (enrollment.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not completed yet'
                });
            }
            // Check for existing certificate
            const [certificate] = await this.getDatabase().execute('SELECT * FROM certificates WHERE user_id = ? AND course_id = ?', [userId, courseId]);
            if (certificate.length > 0) {
                return res.json({
                    success: true,
                    data: certificate[0]
                });
            }
            // Generate certificate ID
            const certificateId = `CERT-${Date.now()}-${userId}-${courseId}`;
            // Create certificate record
            await this.getDatabase().execute(`INSERT INTO certificates 
         (user_id, course_id, certificate_id, issued_at, created_at)
         VALUES (?, ?, ?, NOW(), NOW())`, [userId, courseId, certificateId]);
            res.json({
                success: true,
                data: {
                    certificateId,
                    userName: enrollment[0].user_name,
                    courseTitle: enrollment[0].course_title,
                    completedAt: enrollment[0].completed_at,
                    issuedAt: new Date()
                }
            });
        }
        catch (error) {
            console.error('Get certificate error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate certificate'
            });
        }
    }
}
//# sourceMappingURL=EnrollmentController.js.map