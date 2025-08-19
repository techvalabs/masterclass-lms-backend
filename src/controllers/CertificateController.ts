import { Request, Response } from 'express';
import { BaseController } from './BaseController.js';
import crypto from 'crypto';

export class CertificateController extends BaseController {
  /**
   * Generate certificate for a completed course
   */
  async generateCertificate(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Check if user has completed the course
      const [enrollment]: any = await this.getDatabase().query(`
        SELECT 
          e.*,
          cp.is_completed,
          cp.progress_percentage
        FROM enrollments e
        LEFT JOIN course_progress cp ON cp.course_id = e.course_id AND cp.user_id = e.user_id
        WHERE e.user_id = ? AND e.course_id = ? AND e.is_active = 1
      `, [userId, courseId]);

      if (!enrollment || enrollment.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'You are not enrolled in this course'
        });
      }

      if (!enrollment[0].is_completed || enrollment[0].progress_percentage < 100) {
        return res.status(400).json({
          success: false,
          message: 'You must complete the course before generating a certificate'
        });
      }

      // Check if certificate already exists
      const [existingCert]: any = await this.getDatabase().query(
        'SELECT * FROM certificates WHERE user_id = ? AND course_id = ?',
        [userId, courseId]
      );

      if (existingCert && existingCert.length > 0) {
        return res.json({
          success: true,
          data: await this.formatCertificate(existingCert[0])
        });
      }

      // Generate certificate number
      const certificateNumber = this.generateCertificateNumber();
      const verificationCode = crypto.randomBytes(16).toString('hex');

      // Create certificate
      const [result]: any = await this.getDatabase().query(`
        INSERT INTO certificates (
          user_id, course_id, certificate_number, 
          verification_code, issued_date, is_valid
        ) VALUES (?, ?, ?, ?, NOW(), 1)
      `, [userId, courseId, certificateNumber, verificationCode]);

      // Get the created certificate
      const [certificate]: any = await this.getDatabase().query(
        'SELECT * FROM certificates WHERE id = ?',
        [result.insertId]
      );

      // Update enrollment with certificate info
      await this.getDatabase().query(
        'UPDATE enrollments SET certificate_issued_at = NOW() WHERE user_id = ? AND course_id = ?',
        [userId, courseId]
      );

      return res.json({
        success: true,
        data: await this.formatCertificate(certificate[0])
      });
    } catch (error: any) {
      console.error('Generate certificate error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate certificate',
        error: error.message
      });
    }
  }

  /**
   * Get certificate by course ID
   */
  async getCertificateByCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const userId = (req as any).user?.id;

      const [certificate]: any = await this.getDatabase().query(`
        SELECT 
          c.*,
          co.title as course_name,
          co.duration_hours as course_hours,
          u.name as student_name,
          i.user_id as instructor_user_id,
          iu.name as instructor_name,
          cp.progress_percentage as grade
        FROM certificates c
        JOIN courses co ON c.course_id = co.id
        JOIN users u ON c.user_id = u.id
        LEFT JOIN instructors i ON co.instructor_id = i.id
        LEFT JOIN users iu ON i.user_id = iu.id
        LEFT JOIN course_progress cp ON cp.course_id = c.course_id AND cp.user_id = c.user_id
        WHERE c.user_id = ? AND c.course_id = ? AND c.is_valid = 1
      `, [userId, courseId]);

      if (!certificate || certificate.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found'
        });
      }

      return res.json({
        success: true,
        data: {
          id: certificate[0].id,
          certificateNumber: certificate[0].certificate_number,
          courseName: certificate[0].course_name,
          instructorName: certificate[0].instructor_name,
          completionDate: certificate[0].issued_date,
          courseHours: certificate[0].course_hours,
          grade: Math.round(certificate[0].grade || 100),
          isValid: certificate[0].is_valid === 1
        }
      });
    } catch (error: any) {
      console.error('Get certificate error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch certificate',
        error: error.message
      });
    }
  }

  /**
   * Get all certificates for a user
   */
  async getUserCertificates(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      const [certificates]: any = await this.getDatabase().query(`
        SELECT 
          c.*,
          co.title as course_name,
          co.thumbnail,
          co.duration_hours,
          i.user_id as instructor_user_id,
          u.name as instructor_name
        FROM certificates c
        JOIN courses co ON c.course_id = co.id
        LEFT JOIN instructors i ON co.instructor_id = i.id
        LEFT JOIN users u ON i.user_id = u.id
        WHERE c.user_id = ? AND c.is_valid = 1
        ORDER BY c.issued_date DESC
      `, [userId]);

      const formattedCerts = certificates.map((cert: any) => ({
        id: cert.id,
        certificateNumber: cert.certificate_number,
        courseName: cert.course_name,
        courseThumbnail: cert.thumbnail,
        instructorName: cert.instructor_name,
        completionDate: cert.issued_date,
        courseHours: cert.duration_hours,
        verificationUrl: `/verify/${cert.certificate_number}`
      }));

      return res.json({
        success: true,
        data: formattedCerts
      });
    } catch (error: any) {
      console.error('Get user certificates error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch certificates',
        error: error.message
      });
    }
  }

  /**
   * Verify certificate by number
   */
  async verifyCertificate(req: Request, res: Response) {
    try {
      const { certificateNumber } = req.params;

      const [certificate]: any = await this.getDatabase().query(`
        SELECT 
          c.*,
          co.title as course_name,
          u.name as student_name,
          i.user_id as instructor_user_id,
          iu.name as instructor_name
        FROM certificates c
        JOIN courses co ON c.course_id = co.id
        JOIN users u ON c.user_id = u.id
        LEFT JOIN instructors i ON co.instructor_id = i.id
        LEFT JOIN users iu ON i.user_id = iu.id
        WHERE c.certificate_number = ?
      `, [certificateNumber]);

      if (!certificate || certificate.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Certificate not found',
          valid: false
        });
      }

      const cert = certificate[0];
      const isValid = cert.is_valid === 1;

      return res.json({
        success: true,
        valid: isValid,
        data: {
          certificateNumber: cert.certificate_number,
          studentName: cert.student_name,
          courseName: cert.course_name,
          instructorName: cert.instructor_name,
          issuedDate: cert.issued_date,
          isValid
        }
      });
    } catch (error: any) {
      console.error('Verify certificate error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify certificate',
        error: error.message
      });
    }
  }

  /**
   * Generate unique certificate number
   */
  private generateCertificateNumber(): string {
    const prefix = 'CERT';
    const year = new Date().getFullYear();
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${year}-${randomPart}-${timestamp}`;
  }

  /**
   * Format certificate data
   */
  private async formatCertificate(certificate: any) {
    const [courseData]: any = await this.getDatabase().query(`
      SELECT 
        c.title,
        c.duration_hours,
        i.user_id as instructor_user_id,
        u.name as instructor_name
      FROM courses c
      LEFT JOIN instructors i ON c.instructor_id = i.id
      LEFT JOIN users u ON i.user_id = u.id
      WHERE c.id = ?
    `, [certificate.course_id]);

    return {
      id: certificate.id,
      certificateNumber: certificate.certificate_number,
      courseName: courseData[0].title,
      instructorName: courseData[0].instructor_name,
      completionDate: certificate.issued_date,
      courseHours: courseData[0].duration_hours,
      verificationUrl: `/verify/${certificate.certificate_number}`,
      isValid: certificate.is_valid === 1
    };
  }
}

export const certificateController = new CertificateController();