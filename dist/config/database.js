import mysql from 'mysql2/promise';
import { logger } from '../utils/logger.js';
class Database {
    pool = null;
    config;
    constructor() {
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'masterclass_lms',
            connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
            queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0'),
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true,
            charset: 'utf8mb4',
            timezone: 'Z'
        };
    }
    /**
     * Initialize database connection pool
     */
    async initialize() {
        try {
            this.pool = mysql.createPool({
                host: this.config.host,
                port: this.config.port,
                user: this.config.user,
                password: this.config.password,
                database: this.config.database,
                connectionLimit: this.config.connectionLimit,
                queueLimit: this.config.queueLimit,
                acquireTimeout: this.config.acquireTimeout,
                timeout: this.config.timeout,
                reconnect: this.config.reconnect,
                charset: this.config.charset,
                timezone: this.config.timezone,
                supportBigNumbers: true,
                bigNumberStrings: false,
                dateStrings: false,
                debug: process.env.NODE_ENV === 'development' && process.env.ENABLE_DEBUG === 'true',
                multipleStatements: false,
                namedPlaceholders: false,
            });
            // Test the connection
            await this.testConnection();
            logger.info('Database connection pool initialized successfully', {
                host: this.config.host,
                database: this.config.database,
                connectionLimit: this.config.connectionLimit
            });
        }
        catch (error) {
            logger.error('Failed to initialize database connection pool', error);
            throw error;
        }
    }
    /**
     * Test database connection
     */
    async testConnection() {
        if (!this.pool) {
            throw new Error('Database pool not initialized');
        }
        try {
            const connection = await this.pool.getConnection();
            await connection.query('SELECT 1 as test');
            connection.release();
            logger.info('Database connection test successful');
        }
        catch (error) {
            logger.error('Database connection test failed', error);
            throw error;
        }
    }
    /**
     * Execute a query with parameters
     */
    async query(sql, params) {
        if (!this.pool) {
            throw new Error('Database pool not initialized');
        }
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        }
        catch (error) {
            logger.error('Database query error', {
                sql: sql.substring(0, 200),
                params,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
    /**
     * Execute a query and return the first row
     */
    async queryOne(sql, params) {
        const rows = await this.query(sql, params);
        return rows.length > 0 ? rows[0] : null;
    }
    /**
     * Execute multiple queries in a transaction
     */
    async transaction(queries) {
        if (!this.pool) {
            throw new Error('Database pool not initialized');
        }
        const connection = await this.pool.getConnection();
        try {
            await connection.beginTransaction();
            const results = [];
            for (const query of queries) {
                const [rows] = await connection.execute(query.sql, query.params);
                results.push(rows);
            }
            await connection.commit();
            return results;
        }
        catch (error) {
            await connection.rollback();
            logger.error('Transaction error', error);
            throw error;
        }
        finally {
            connection.release();
        }
    }
    /**
     * Execute a custom transaction with callback
     */
    async executeTransaction(callback) {
        if (!this.pool) {
            throw new Error('Database pool not initialized');
        }
        const connection = await this.pool.getConnection();
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
    /**
     * Insert a record and return the inserted ID
     */
    async insert(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        const columns = keys.join(', ');
        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        if (!this.pool) {
            throw new Error('Database pool not initialized');
        }
        try {
            const [result] = await this.pool.execute(sql, values);
            return result.insertId;
        }
        catch (error) {
            logger.error('Insert error', {
                table,
                data,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
    /**
     * Update records
     */
    async update(table, data, where) {
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const values = [...Object.values(data), ...Object.values(where)];
        const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
        if (!this.pool) {
            throw new Error('Database pool not initialized');
        }
        try {
            const [result] = await this.pool.execute(sql, values);
            return result.affectedRows;
        }
        catch (error) {
            logger.error('Update error', {
                table,
                data,
                where,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
    /**
     * Delete records
     */
    async delete(table, where) {
        const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const values = Object.values(where);
        const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
        if (!this.pool) {
            throw new Error('Database pool not initialized');
        }
        try {
            const [result] = await this.pool.execute(sql, values);
            return result.affectedRows;
        }
        catch (error) {
            logger.error('Delete error', {
                table,
                where,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
    /**
     * Get database pool statistics
     */
    getPoolStats() {
        if (!this.pool) {
            return null;
        }
        return {
            connectionLimit: this.config.connectionLimit,
            // Note: mysql2 doesn't expose these stats directly
            // but we can track them if needed
        };
    }
    /**
     * Close the database connection pool
     */
    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            logger.info('Database connection pool closed');
        }
    }
    /**
     * Get the raw pool instance for advanced operations
     */
    getPool() {
        return this.pool;
    }
}
// Create and export database instance
export const db = new Database();
// Helper function for building WHERE clauses
export function buildWhereClause(conditions) {
    const keys = Object.keys(conditions).filter(key => conditions[key] !== undefined);
    if (keys.length === 0) {
        return { clause: '', values: [] };
    }
    const clause = keys.map(key => {
        const value = conditions[key];
        if (Array.isArray(value)) {
            const placeholders = value.map(() => '?').join(', ');
            return `${key} IN (${placeholders})`;
        }
        return `${key} = ?`;
    }).join(' AND ');
    const values = keys.reduce((acc, key) => {
        const value = conditions[key];
        if (Array.isArray(value)) {
            return acc.concat(value);
        }
        return acc.concat(value);
    }, []);
    return { clause: `WHERE ${clause}`, values };
}
// Helper function for building pagination
export function buildPagination(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return {
        offset,
        limit,
        sql: `LIMIT ${limit} OFFSET ${offset}`
    };
}
//# sourceMappingURL=database.js.map