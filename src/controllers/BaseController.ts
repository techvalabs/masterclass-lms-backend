import { Pool } from 'mysql2/promise';
import { db } from '../config/database.js';

export class BaseController {
  protected getDatabase(): Pool {
    const pool = db.getPool();
    if (!pool) {
      throw new Error('Database connection not available');
    }
    return pool;
  }

  protected async withTransaction<T>(callback: (connection: any) => Promise<T>): Promise<T> {
    const pool = this.getDatabase();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}