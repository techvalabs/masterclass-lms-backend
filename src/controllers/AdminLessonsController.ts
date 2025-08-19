import { Request, Response } from 'express';
import mysql from 'mysql2/promise';

export default class AdminLessonsController {
  private db: mysql.Pool | null;

  constructor(db: mysql.Pool | null) {
    this.db = db;
    
    // Bind all methods to maintain context
    this.getLessons = this.getLessons.bind(this);
    this.getLessonById = this.getLessonById.bind(this);
    this.createLesson = this.createLesson.bind(this);
    this.updateLesson = this.updateLesson.bind(this);
    this.deleteLesson = this.deleteLesson.bind(this);
    this.reorderLessons = this.reorderLessons.bind(this);
    this.getQuizzes = this.getQuizzes.bind(this);
    this.createQuiz = this.createQuiz.bind(this);
    this.updateQuiz = this.updateQuiz.bind(this);
    this.deleteQuiz = this.deleteQuiz.bind(this);
  }

  private getDatabase(): mysql.Pool {
    if (!this.db) {
      throw new Error('Database not available');
    }
    return this.db;
  }

  /**
   * Get all lessons for a course
   */
  async getLessons(req: Request, res: Response) {
    const { courseId } = req.params;

    try {
      const db = this.getDatabase();
      
      const [lessons] = await db.execute(`
        SELECT 
          cl.*,
          COUNT(DISTINCT q.id) as quiz_count
        FROM course_lessons cl
        LEFT JOIN quizzes q ON cl.id = q.lesson_id
        WHERE cl.course_id = ?
        GROUP BY cl.id
        ORDER BY cl.lesson_order ASC, cl.created_at ASC
      `, [courseId]);

      res.json({
        success: true,
        data: lessons
      });
    } catch (error) {
      console.error('Error fetching lessons:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lessons',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get lesson by ID
   */
  async getLessonById(req: Request, res: Response) {
    const { courseId, lessonId } = req.params;

    try {
      const db = this.getDatabase();
      
      const [lessons] = await db.execute(`
        SELECT 
          cl.*,
          COUNT(DISTINCT q.id) as quiz_count
        FROM course_lessons cl
        LEFT JOIN quizzes q ON cl.id = q.lesson_id
        WHERE cl.id = ? AND cl.course_id = ?
        GROUP BY cl.id
      `, [lessonId, courseId]);

      if (!lessons || (lessons as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      // No resources table, set empty array
      const resources = [];

      // Get quiz if exists
      const [quizzes] = await db.execute(`
        SELECT q.*
        FROM quizzes q
        WHERE q.lesson_id = ?
      `, [lessonId]);

      const lesson = (lessons as any[])[0];
      lesson.resources = resources;
      lesson.quiz = (quizzes as any[]).length > 0 ? (quizzes as any[])[0] : null;

      res.json({
        success: true,
        data: lesson
      });
    } catch (error) {
      console.error('Error fetching lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lesson',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create new lesson
   */
  async createLesson(req: Request, res: Response) {
    const { courseId } = req.params;
    const {
      title,
      description,
      video_url,
      video_duration,
      content,
      is_preview,
      is_published,
      sort_order
    } = req.body;

    try {
      const db = this.getDatabase();

      // Get the next lesson order if not provided
      let finalSortOrder = sort_order;
      if (!finalSortOrder) {
        const [maxOrder] = await db.execute(`
          SELECT MAX(lesson_order) as max_order
          FROM course_lessons
          WHERE course_id = ?
        `, [courseId]);
        finalSortOrder = ((maxOrder as any[])[0]?.max_order || 0) + 1;
      }

      const [result] = await db.execute(`
        INSERT INTO course_lessons (
          course_id, title, description, video_url, duration_minutes,
          content_type, is_free_preview, lesson_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        courseId,
        title,
        description || null,
        video_url || null,
        video_duration || duration_minutes || 0,
        content_type || 'video',
        is_preview || is_free_preview || 0,
        finalSortOrder
      ]);

      const lessonId = (result as any).insertId;

      // Update course total lessons count
      await db.execute(`
        UPDATE courses 
        SET total_lessons = (
          SELECT COUNT(*) FROM course_lessons WHERE course_id = ?
        ),
        updated_at = NOW()
        WHERE id = ?
      `, [courseId, courseId]);

      res.json({
        success: true,
        data: {
          id: lessonId,
          message: 'Lesson created successfully'
        }
      });
    } catch (error) {
      console.error('Error creating lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create lesson',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update lesson
   */
  async updateLesson(req: Request, res: Response) {
    const { courseId, lessonId } = req.params;
    const updates = req.body;

    try {
      const db = this.getDatabase();

      // Build dynamic update query
      const fields = Object.keys(updates).filter(key => 
        !['id', 'course_id', 'created_at'].includes(key)
      );
      
      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field]);
      values.push(lessonId, courseId);

      await db.execute(`
        UPDATE course_lessons 
        SET ${setClause}, updated_at = NOW()
        WHERE id = ? AND course_id = ?
      `, values);

      res.json({
        success: true,
        message: 'Lesson updated successfully'
      });
    } catch (error) {
      console.error('Error updating lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update lesson',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete lesson
   */
  async deleteLesson(req: Request, res: Response) {
    const { courseId, lessonId } = req.params;

    try {
      const db = this.getDatabase();

      // Start transaction
      await db.query('START TRANSACTION');

      try {
        // Delete related data
        await db.execute('DELETE FROM lesson_resources WHERE lesson_id = ?', [lessonId]);
        await db.execute('DELETE FROM quiz_attempts WHERE quiz_id IN (SELECT id FROM quizzes WHERE lesson_id = ?)', [lessonId]);
        await db.execute('DELETE FROM quiz_questions WHERE quiz_id IN (SELECT id FROM quizzes WHERE lesson_id = ?)', [lessonId]);
        await db.execute('DELETE FROM quizzes WHERE lesson_id = ?', [lessonId]);
        await db.execute('DELETE FROM lesson_progress WHERE lesson_id = ?', [lessonId]);
        
        // Delete the lesson
        await db.execute('DELETE FROM course_lessons WHERE id = ? AND course_id = ?', [lessonId, courseId]);

        // Update course total lessons count
        await db.execute(`
          UPDATE courses 
          SET total_lessons = (
            SELECT COUNT(*) FROM course_lessons WHERE course_id = ?
          ),
          updated_at = NOW()
          WHERE id = ?
        `, [courseId, courseId]);

        await db.query('COMMIT');

        res.json({
          success: true,
          message: 'Lesson deleted successfully'
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete lesson',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Reorder lessons
   */
  async reorderLessons(req: Request, res: Response) {
    const { courseId } = req.params;
    const { lessons } = req.body; // Array of { id, sort_order }

    try {
      const db = this.getDatabase();

      // Start transaction
      await db.query('START TRANSACTION');

      try {
        for (const lesson of lessons) {
          await db.execute(`
            UPDATE course_lessons 
            SET lesson_order = ?, updated_at = NOW()
            WHERE id = ? AND course_id = ?
          `, [lesson.lesson_order || lesson.sort_order, lesson.id, courseId]);
        }

        await db.query('COMMIT');

        res.json({
          success: true,
          message: 'Lessons reordered successfully'
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error reordering lessons:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder lessons',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get quizzes for a lesson
   */
  async getQuizzes(req: Request, res: Response) {
    const { lessonId } = req.params;

    try {
      const db = this.getDatabase();
      
      const [quizzes] = await db.execute(`
        SELECT q.*, 
          COUNT(DISTINCT qq.id) as question_count,
          COUNT(DISTINCT qa.id) as attempt_count
        FROM quizzes q
        LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
        LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
        WHERE q.lesson_id = ?
        GROUP BY q.id
      `, [lessonId]);

      // Parse questions from JSON for each quiz
      for (const quiz of quizzes as any[]) {
        // Questions are stored as JSON in the quizzes table
        if (quiz.questions && typeof quiz.questions === 'string') {
          try {
            quiz.questions = JSON.parse(quiz.questions);
          } catch (e) {
            quiz.questions = [];
          }
        }
        
        // Count questions if they exist
        quiz.question_count = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
      }

      res.json({
        success: true,
        data: quizzes
      });
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quizzes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create quiz
   */
  async createQuiz(req: Request, res: Response) {
    const { lessonId } = req.params;
    const {
      title,
      description,
      pass_percentage,
      time_limit,
      max_attempts,
      questions
    } = req.body;

    try {
      const db = this.getDatabase();

      // Start transaction
      await db.query('START TRANSACTION');

      try {
        // Create quiz
        const [quizResult] = await db.execute(`
          INSERT INTO quizzes (
            lesson_id, title, description, pass_percentage,
            time_limit, max_attempts, is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
        `, [
          lessonId,
          title,
          description || null,
          pass_percentage || 70,
          time_limit || null,
          max_attempts || null
        ]);

        const quizId = (quizResult as any).insertId;

        // Add questions if provided
        if (questions && questions.length > 0) {
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            await db.execute(`
              INSERT INTO quiz_questions (
                quiz_id, question_text, question_type,
                options, correct_answer, explanation,
                points, sort_order, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
              quizId,
              q.question_text,
              q.question_type || 'single_choice',
              JSON.stringify(q.options || []),
              q.correct_answer,
              q.explanation || null,
              q.points || 1,
              i + 1
            ]);
          }
        }

        await db.query('COMMIT');

        res.json({
          success: true,
          data: {
            id: quizId,
            message: 'Quiz created successfully'
          }
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create quiz',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update quiz
   */
  async updateQuiz(req: Request, res: Response) {
    const { quizId } = req.params;
    const { questions, ...quizData } = req.body;

    try {
      const db = this.getDatabase();

      // Start transaction
      await db.query('START TRANSACTION');

      try {
        // Update quiz data if provided
        if (Object.keys(quizData).length > 0) {
          const fields = Object.keys(quizData);
          const setClause = fields.map(field => `${field} = ?`).join(', ');
          const values = fields.map(field => quizData[field]);
          values.push(quizId);

          await db.execute(`
            UPDATE quizzes 
            SET ${setClause}, updated_at = NOW()
            WHERE id = ?
          `, values);
        }

        // Update questions if provided
        if (questions) {
          // Delete existing questions
          await db.execute('DELETE FROM quiz_questions WHERE quiz_id = ?', [quizId]);

          // Add new questions
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            await db.execute(`
              INSERT INTO quiz_questions (
                quiz_id, question_text, question_type,
                options, correct_answer, explanation,
                points, sort_order, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
              quizId,
              q.question_text,
              q.question_type || 'single_choice',
              JSON.stringify(q.options || []),
              q.correct_answer,
              q.explanation || null,
              q.points || 1,
              i + 1
            ]);
          }
        }

        await db.query('COMMIT');

        res.json({
          success: true,
          message: 'Quiz updated successfully'
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update quiz',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete quiz
   */
  async deleteQuiz(req: Request, res: Response) {
    const { quizId } = req.params;

    try {
      const db = this.getDatabase();

      // Start transaction
      await db.query('START TRANSACTION');

      try {
        // Delete related data
        await db.execute('DELETE FROM quiz_attempts WHERE quiz_id = ?', [quizId]);
        await db.execute('DELETE FROM quiz_questions WHERE quiz_id = ?', [quizId]);
        await db.execute('DELETE FROM quizzes WHERE id = ?', [quizId]);

        await db.query('COMMIT');

        res.json({
          success: true,
          message: 'Quiz deleted successfully'
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete quiz',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}