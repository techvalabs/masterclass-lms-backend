import { BaseController } from './BaseController.js';
export class TestController extends BaseController {
    async checkDatabaseTable(req, res) {
        try {
            const { tableName } = req.params;
            // Sanitize table name to prevent SQL injection
            const allowedTables = [
                'payment_transactions',
                'course_progress',
                'lesson_progress',
                'video_uploads',
                'file_uploads',
                'course_lessons'
            ];
            if (!allowedTables.includes(tableName)) {
                return res.status(400).json({ error: 'Invalid table name' });
            }
            const [result] = await this.getDatabase().query(`SELECT COUNT(*) as count FROM information_schema.tables 
         WHERE table_schema = DATABASE() AND table_name = ?`, [tableName]);
            const exists = result[0].count > 0;
            if (exists) {
                // Also get row count
                const [rowCount] = await this.getDatabase().query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
                return res.json({
                    exists: true,
                    tableName,
                    rowCount: rowCount[0].count
                });
            }
            else {
                return res.status(404).json({
                    exists: false,
                    tableName,
                    message: 'Table does not exist'
                });
            }
        }
        catch (error) {
            console.error('Error checking table:', error);
            return res.status(500).json({
                error: 'Failed to check table',
                message: error.message
            });
        }
    }
    async getSystemStatus(req, res) {
        try {
            // Check all critical tables
            const tables = [
                'users',
                'courses',
                'enrollments',
                'payment_transactions',
                'course_progress',
                'lesson_progress',
                'video_uploads'
            ];
            const tableStatus = {};
            for (const table of tables) {
                try {
                    const [result] = await this.getDatabase().query(`SELECT COUNT(*) as count FROM information_schema.tables 
             WHERE table_schema = DATABASE() AND table_name = ?`, [table]);
                    tableStatus[table] = result[0].count > 0;
                }
                catch (error) {
                    tableStatus[table] = false;
                }
            }
            // Get database connection status
            const pool = this.getDatabase();
            const poolState = pool?.pool?._allConnections?.length || 0;
            return res.json({
                status: 'operational',
                database: {
                    connected: true,
                    activeConnections: poolState,
                    tables: tableStatus
                },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            return res.status(500).json({
                status: 'error',
                error: error.message
            });
        }
    }
}
export const testController = new TestController();
//# sourceMappingURL=TestController.js.map