import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';

export class MockPaymentController extends BaseController {
  // Mock checkout - instantly enrolls user
  async createMockCheckout(req: Request, res: Response) {
    try {
      const { courseId } = req.body;
      const userId = (req as any).userId;

      // Check if course exists
      const [courses]: any = await this.getDatabase().execute(
        'SELECT * FROM courses WHERE id = ?',
        [courseId]
      );

      if (courses.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      const course = courses[0];

      // Check if already enrolled
      const [enrollments]: any = await this.getDatabase().execute(
        'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
        [userId, courseId]
      );

      if (enrollments.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Already enrolled in this course'
        });
      }

      const db = this.getDatabase();
      await db.query('START TRANSACTION');

      try {
        // Create mock payment record
        const mockTransactionId = `MOCK-${Date.now()}-${userId}-${courseId}`;
        
        await db.execute(
          `INSERT INTO payment_transactions 
           (user_id, course_id, amount, currency, status, payment_method, transaction_id, created_at, completed_at) 
           VALUES (?, ?, ?, ?, 'completed', 'mock', ?, NOW(), NOW())`,
          [
            userId,
            courseId,
            course.discount_price || course.price || 0,
            course.currency || 'USD',
            mockTransactionId
          ]
        );

        // Create enrollment
        await db.execute(
          `INSERT INTO enrollments 
           (user_id, course_id, status, payment_status, enrolled_at, created_at) 
           VALUES (?, ?, 'active', 'paid', NOW(), NOW())`,
          [userId, courseId]
        );

        // Update course stats
        await db.execute(
          `UPDATE courses 
           SET total_students = COALESCE(total_students, 0) + 1 
           WHERE id = ?`,
          [courseId]
        );

        // Create initial progress record
        await db.execute(
          `INSERT INTO course_progress 
           (user_id, course_id, progress_percentage, last_accessed_at, created_at) 
           VALUES (?, ?, 0, NOW(), NOW())
           ON DUPLICATE KEY UPDATE last_accessed_at = NOW()`,
          [userId, courseId]
        );

        await db.query('COMMIT');

        res.json({
          success: true,
          data: {
            enrolled: true,
            transactionId: mockTransactionId,
            course: {
              id: course.id,
              title: course.title,
              price: course.discount_price || course.price || 0
            },
            message: 'Mock payment successful! You are now enrolled.'
          }
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Mock checkout error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process mock payment'
      });
    }
  }

  // Get mock payment status
  async getMockPaymentStatus(req: Request, res: Response) {
    try {
      const { transactionId } = req.params;
      
      const [transactions]: any = await this.getDatabase().execute(
        `SELECT 
          pt.*,
          c.title as course_title,
          c.thumbnail as course_thumbnail
         FROM payment_transactions pt
         JOIN courses c ON pt.course_id = c.id
         WHERE pt.transaction_id = ?`,
        [transactionId]
      );

      if (transactions.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.json({
        success: true,
        data: transactions[0]
      });
    } catch (error) {
      console.error('Get payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment status'
      });
    }
  }

  // Free enrollment for preview courses
  async enrollFree(req: Request, res: Response) {
    try {
      const { courseId } = req.body;
      const userId = (req as any).userId;

      // Check if course exists and is free
      const [courses]: any = await this.getDatabase().execute(
        'SELECT * FROM courses WHERE id = ? AND (price = 0 OR price IS NULL)',
        [courseId]
      );

      if (courses.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Free course not found'
        });
      }

      // Check if already enrolled
      const [enrollments]: any = await this.getDatabase().execute(
        'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
        [userId, courseId]
      );

      if (enrollments.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Already enrolled in this course'
        });
      }

      const db = this.getDatabase();
      await db.query('START TRANSACTION');

      try {
        // Create enrollment
        await db.execute(
          `INSERT INTO enrollments 
           (user_id, course_id, status, payment_status, enrolled_at, created_at) 
           VALUES (?, ?, 'active', 'free', NOW(), NOW())`,
          [userId, courseId]
        );

        // Update course stats
        await db.execute(
          `UPDATE courses 
           SET total_students = COALESCE(total_students, 0) + 1 
           WHERE id = ?`,
          [courseId]
        );

        // Create initial progress
        await db.execute(
          `INSERT INTO course_progress 
           (user_id, course_id, progress_percentage, last_accessed_at, created_at) 
           VALUES (?, ?, 0, NOW(), NOW())
           ON DUPLICATE KEY UPDATE last_accessed_at = NOW()`,
          [userId, courseId]
        );

        await db.query('COMMIT');

        res.json({
          success: true,
          data: {
            enrolled: true,
            message: 'Successfully enrolled in free course!'
          }
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Free enrollment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enroll in free course'
      });
    }
  }
}