import { RedisClientType } from 'redis';
/**
 * Redis Client Configuration and Management
 * Provides caching and session management capabilities
 */
export declare class RedisClient {
    private static client;
    private static isConnected;
    /**
     * Initialize Redis connection
     */
    static initialize(): Promise<void>;
    /**
     * Get Redis client instance
     */
    static getClient(): RedisClientType | null;
    /**
     * Check if Redis is connected
     */
    static get connected(): boolean;
    /**
     * Set a key-value pair with optional TTL
     */
    static set(key: string, value: any, ttlSeconds?: number): Promise<boolean>;
    /**
     * Get a value by key
     */
    static get<T = any>(key: string): Promise<T | null>;
    /**
     * Delete a key
     */
    static del(key: string): Promise<boolean>;
    /**
     * Delete multiple keys
     */
    static delMultiple(keys: string[]): Promise<number>;
    /**
     * Check if a key exists
     */
    static exists(key: string): Promise<boolean>;
    /**
     * Set expiration time for a key
     */
    static expire(key: string, seconds: number): Promise<boolean>;
    /**
     * Get TTL for a key
     */
    static ttl(key: string): Promise<number>;
    /**
     * Increment a numeric value
     */
    static incr(key: string): Promise<number | null>;
    /**
     * Increment by a specific amount
     */
    static incrBy(key: string, increment: number): Promise<number | null>;
    /**
     * Get multiple keys at once
     */
    static mget<T = any>(keys: string[]): Promise<(T | null)[]>;
    /**
     * Set multiple key-value pairs
     */
    static mset(keyValues: Record<string, any>): Promise<boolean>;
    /**
     * Find keys matching a pattern
     */
    static keys(pattern: string): Promise<string[]>;
    /**
     * Delete keys matching a pattern
     */
    static deletePattern(pattern: string): Promise<number>;
    /**
     * Flush all data from current database
     */
    static flushdb(): Promise<boolean>;
    /**
     * Get Redis server info
     */
    static info(): Promise<string | null>;
    /**
     * Get cache statistics
     */
    static getStats(): Promise<{
        connected: boolean;
        keys: number;
        memory_usage: string;
        uptime: number;
        version: string;
    } | null>;
    /**
     * Close Redis connection
     */
    static close(): Promise<void>;
}
export declare const cache: {
    /**
     * User session cache
     */
    user: {
        set: (userId: string, data: any, ttl?: number) => Promise<boolean>;
        get: <T = any>(userId: string) => Promise<T | null>;
        del: (userId: string) => Promise<boolean>;
    };
    /**
     * Course data cache
     */
    course: {
        set: (courseId: string, data: any, ttl?: number) => Promise<boolean>;
        get: <T = any>(courseId: string) => Promise<T | null>;
        del: (courseId: string) => Promise<boolean>;
    };
    /**
     * Enrollment cache
     */
    enrollment: {
        set: (userId: string, courseId: string, data: any, ttl?: number) => Promise<boolean>;
        get: <T = any>(userId: string, courseId: string) => Promise<T | null>;
        del: (userId: string, courseId: string) => Promise<boolean>;
    };
    /**
     * Progress cache
     */
    progress: {
        set: (userId: string, courseId: string, data: any, ttl?: number) => Promise<boolean>;
        get: <T = any>(userId: string, courseId: string) => Promise<T | null>;
        del: (userId: string, courseId: string) => Promise<boolean>;
    };
    /**
     * Quiz results cache
     */
    quiz: {
        set: (userId: string, quizId: string, data: any, ttl?: number) => Promise<boolean>;
        get: <T = any>(userId: string, quizId: string) => Promise<T | null>;
        del: (userId: string, quizId: string) => Promise<boolean>;
    };
    /**
     * Analytics cache
     */
    analytics: {
        set: (type: string, timeframe: string, data: any, ttl?: number) => Promise<boolean>;
        get: <T = any>(type: string, timeframe: string) => Promise<T | null>;
        del: (type: string, timeframe: string) => Promise<boolean>;
    };
};
export default RedisClient;
//# sourceMappingURL=redis.d.ts.map