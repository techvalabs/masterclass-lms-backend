import mysql from 'mysql2/promise';
interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    connectionLimit: number;
    queueLimit: number;
    acquireTimeout: number;
    timeout: number;
    reconnect: boolean;
    charset: string;
    timezone: string;
}
declare class Database {
    private pool;
    private config;
    constructor();
    /**
     * Initialize database connection pool
     */
    initialize(): Promise<void>;
    /**
     * Test database connection
     */
    private testConnection;
    /**
     * Execute a query with parameters
     */
    query<T = any>(sql: string, params?: any[]): Promise<T[]>;
    /**
     * Execute a query and return the first row
     */
    queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
    /**
     * Execute multiple queries in a transaction
     */
    transaction<T>(queries: Array<{
        sql: string;
        params?: any[];
    }>): Promise<T[]>;
    /**
     * Execute a custom transaction with callback
     */
    executeTransaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T>;
    /**
     * Insert a record and return the inserted ID
     */
    insert(table: string, data: Record<string, any>): Promise<number>;
    /**
     * Update records
     */
    update(table: string, data: Record<string, any>, where: Record<string, any>): Promise<number>;
    /**
     * Delete records
     */
    delete(table: string, where: Record<string, any>): Promise<number>;
    /**
     * Get database pool statistics
     */
    getPoolStats(): {
        connectionLimit: number;
    } | null;
    /**
     * Close the database connection pool
     */
    close(): Promise<void>;
    /**
     * Get the raw pool instance for advanced operations
     */
    getPool(): mysql.Pool | null;
}
export declare const db: Database;
export type { DatabaseConfig };
export type QueryResult<T> = T[];
export type QueryOneResult<T> = T | null;
export declare function buildWhereClause(conditions: Record<string, any>): {
    clause: string;
    values: any[];
};
export declare function buildPagination(page?: number, limit?: number): {
    offset: number;
    limit: number;
    sql: string;
};
//# sourceMappingURL=database.d.ts.map