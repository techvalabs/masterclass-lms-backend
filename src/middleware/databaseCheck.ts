import { Request, Response, NextFunction } from 'express';
import { db } from '@/config/database.js';

/**
 * Middleware to check database connectivity before processing routes
 */
export const checkDatabaseConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Simple database connectivity check
    await db.query('SELECT 1 as test');
    next();
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database temporarily unavailable',
      error: 'SERVICE_UNAVAILABLE',
      details: process.env.NODE_ENV === 'development' ? {
        message: 'MySQL database connection failed',
        suggestions: [
          'Start MySQL server in Laragon',
          'Verify database credentials in .env file',
          'Ensure database "masterclass_lms" exists',
          'Check if MySQL is running on localhost:3306'
        ]
      } : undefined
    });
  }
};

export default checkDatabaseConnection;