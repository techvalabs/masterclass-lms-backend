import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';

const router = Router();

// Get course preview with lessons (public endpoint)
router.get('/course-preview/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const pool = db.getPool();
    
    if (!pool) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not available'
      });
    }

    // Check if user is authenticated (optional - for admin/instructor access to unpublished courses)
    let userRole = null;
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        
        // Get user role from database since it's not in the JWT payload
        const [users] = await pool.execute(
          'SELECT u.id, r.name as role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
          [decoded.userId]
        );
        
        if (users && (users as any[]).length > 0) {
          const user = (users as any[])[0];
          userRole = user.role;
          userId = user.id;
          console.log(`User ${userId} with role ${userRole} accessing course ${courseId}`);
        }
      } catch (err) {
        // Token invalid or expired, continue as public user
        console.log('Token validation failed, continuing as public user:', err.message);
      }
    }

    // Build WHERE clause based on user role
    let whereClause = 'WHERE c.id = ?';
    // Only enforce published status for non-admin/instructor users
    if (userRole !== 'admin' && userRole !== 'instructor') {
      whereClause += ' AND c.is_published = TRUE';
    }

    // Get course details
    const [courses] = await pool.execute(`
      SELECT 
        c.*,
        i.id as instructor_id,
        u.name as instructor_name,
        u.email as instructor_email,
        cc.name as category_name
      FROM courses c
      LEFT JOIN instructors i ON c.instructor_id = i.id
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN course_categories cc ON c.category_id = cc.id
      ${whereClause}
    `, [courseId]);

    if (!courses || (courses as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: userRole === 'admin' || userRole === 'instructor' 
          ? 'Course not found' 
          : 'Course not found or not published'
      });
    }

    const course = (courses as any[])[0];

    // Get course lessons
    const [lessons] = await pool.execute(`
      SELECT 
        id,
        title,
        description,
        content_type,
        video_url,
        duration_minutes,
        lesson_order,
        is_free_preview
      FROM course_lessons
      WHERE course_id = ?
      ORDER BY lesson_order
    `, [courseId]);

    course.lessons = lessons;

    // Get course stats
    const [enrollments] = await pool.execute(`
      SELECT COUNT(*) as enrollment_count
      FROM enrollments
      WHERE course_id = ?
    `, [courseId]);

    course.total_students = (enrollments as any[])[0]?.enrollment_count || 0;

    // Get course reviews summary
    const [reviews] = await pool.execute(`
      SELECT 
        COUNT(*) as review_count,
        AVG(rating) as average_rating
      FROM course_reviews
      WHERE course_id = ?
    `, [courseId]);

    course.total_reviews = (reviews as any[])[0]?.review_count || 0;
    course.rating = (reviews as any[])[0]?.average_rating || 0;

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course preview',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get quiz for a lesson (for preview mode)
router.get('/lessons/:lessonId/quiz', async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    const pool = db.getPool();
    
    if (!pool) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not available'
      });
    }

    // Get quiz for the lesson
    const [quizzes] = await pool.execute(`
      SELECT 
        id,
        course_id,
        lesson_id,
        title,
        description,
        questions,
        passing_score,
        time_limit_minutes
      FROM quizzes
      WHERE lesson_id = ?
      LIMIT 1
    `, [lessonId]);

    if (!quizzes || (quizzes as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found for this lesson'
      });
    }

    const quiz = (quizzes as any[])[0];
    
    // Parse questions if they're stored as JSON string
    if (typeof quiz.questions === 'string') {
      try {
        quiz.questions = JSON.parse(quiz.questions);
      } catch (e) {
        console.error('Failed to parse quiz questions:', e);
        quiz.questions = [];
      }
    }

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz'
    });
  }
});

// Submit quiz attempt (preview mode - no saving)
router.post('/lessons/:lessonId/quiz/submit', async (req, res) => {
  try {
    const { answers, quizId } = req.body;
    const pool = db.getPool();
    
    if (!pool) {
      return res.status(503).json({
        success: false,
        message: 'Database connection not available'
      });
    }

    // Get quiz details
    const [quizzes] = await pool.execute(`
      SELECT 
        questions,
        passing_score
      FROM quizzes
      WHERE id = ?
    `, [quizId]);

    if (!quizzes || (quizzes as any[]).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const quiz = (quizzes as any[])[0];
    let questions = quiz.questions;
    
    if (typeof questions === 'string') {
      questions = JSON.parse(questions);
    }

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    const results = [];

    for (const question of questions) {
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === 'multiple') {
        // For multiple choice, check if arrays match
        const correctArray = Array.isArray(question.correct_answer) 
          ? question.correct_answer 
          : [question.correct_answer];
        const userArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        
        isCorrect = correctArray.length === userArray.length &&
          correctArray.every((ans: string) => userArray.includes(ans));
      } else {
        // For single choice or true/false
        isCorrect = userAnswer === question.correct_answer;
      }

      if (isCorrect) {
        correctAnswers++;
        totalPoints += question.points || 10;
      }

      results.push({
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correct_answer,
        isCorrect,
        explanation: question.explanation,
        points: isCorrect ? (question.points || 10) : 0
      });
    }

    const maxPoints = questions.reduce((sum: number, q: any) => sum + (q.points || 10), 0);
    const percentage = (totalPoints / maxPoints) * 100;
    const passed = percentage >= quiz.passing_score;

    res.json({
      success: true,
      data: {
        results,
        correctAnswers,
        totalQuestions: questions.length,
        totalPoints,
        maxPoints,
        percentage: Math.round(percentage),
        passed,
        passingScore: quiz.passing_score
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz'
    });
  }
});

export default router;