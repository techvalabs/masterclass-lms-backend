import { db } from '../config/database.js';
export class BaseController {
    getDatabase() {
        const pool = db.getPool();
        if (!pool) {
            throw new Error('Database connection not available');
        }
        return pool;
    }
    async withTransaction(callback) {
        const pool = this.getDatabase();
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();
            return result;
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
}
//# sourceMappingURL=BaseController.js.map