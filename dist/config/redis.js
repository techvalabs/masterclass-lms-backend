import { createClient } from 'redis';
import { logger } from '@/utils/logger.js';
import { config, cacheConfig } from '@/config/index.js';
/**
 * Redis Client Configuration and Management
 * Provides caching and session management capabilities
 */
export class RedisClient {
    static client = null;
    static isConnected = false;
    /**
     * Initialize Redis connection
     */
    static async initialize() {
        try {
            // Create Redis client
            this.client = createClient({
                socket: {
                    host: config.redis.host,
                    port: config.redis.port,
                    connectTimeout: 10000,
                    lazyConnect: true,
                },
                password: config.redis.password,
                database: config.redis.db,
                retry_strategy: (options) => {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        logger.error('Redis connection refused');
                        return new Error('Redis connection refused');
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        logger.error('Redis retry time exhausted');
                        return new Error('Retry time exhausted');
                    }
                    if (options.attempt > 10) {
                        logger.error('Redis retry attempts exhausted');
                        return undefined;
                    }
                    // Reconnect after 2^attempt * 100ms (exponential backoff)
                    return Math.min(options.attempt * 100, 3000);
                },
            });
            // Event handlers
            this.client.on('error', (error) => {
                logger.error('Redis client error:', error);
                this.isConnected = false;
            });
            this.client.on('connect', () => {
                logger.info('Redis client connected');
            });
            this.client.on('ready', () => {
                logger.info('Redis client ready');
                this.isConnected = true;
            });
            this.client.on('end', () => {
                logger.warn('Redis connection ended');
                this.isConnected = false;
            });
            this.client.on('reconnecting', () => {
                logger.info('Redis client reconnecting...');
            });
            // Connect to Redis
            await this.client.connect();
            // Test connection
            await this.client.ping();
            logger.info('Redis connection established successfully');
        }
        catch (error) {
            logger.warn('Redis initialization failed:', error);
            this.client = null;
            this.isConnected = false;
            // Don't throw error - Redis is optional
        }
    }
    /**
     * Get Redis client instance
     */
    static getClient() {
        return this.client;
    }
    /**
     * Check if Redis is connected
     */
    static get connected() {
        return this.isConnected && this.client !== null;
    }
    /**
     * Set a key-value pair with optional TTL
     */
    static async set(key, value, ttlSeconds = cacheConfig.ttl) {
        if (!this.connected) {
            logger.debug('Redis not connected, skipping set operation');
            return false;
        }
        try {
            const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
            if (ttlSeconds > 0) {
                await this.client.setEx(key, ttlSeconds, serializedValue);
            }
            else {
                await this.client.set(key, serializedValue);
            }
            return true;
        }
        catch (error) {
            logger.error('Redis SET error:', { key, error });
            return false;
        }
    }
    /**
     * Get a value by key
     */
    static async get(key) {
        if (!this.connected) {
            logger.debug('Redis not connected, skipping get operation');
            return null;
        }
        try {
            const value = await this.client.get(key);
            if (value === null) {
                return null;
            }
            // Try to parse as JSON, fallback to string
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        }
        catch (error) {
            logger.error('Redis GET error:', { key, error });
            return null;
        }
    }
    /**
     * Delete a key
     */
    static async del(key) {
        if (!this.connected) {
            logger.debug('Redis not connected, skipping delete operation');
            return false;
        }
        try {
            const result = await this.client.del(key);
            return result > 0;
        }
        catch (error) {
            logger.error('Redis DELETE error:', { key, error });
            return false;
        }
    }
    /**
     * Delete multiple keys
     */
    static async delMultiple(keys) {
        if (!this.connected || keys.length === 0) {
            return 0;
        }
        try {
            return await this.client.del(keys);
        }
        catch (error) {
            logger.error('Redis DELETE MULTIPLE error:', { keys, error });
            return 0;
        }
    }
    /**
     * Check if a key exists
     */
    static async exists(key) {
        if (!this.connected) {
            return false;
        }
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            logger.error('Redis EXISTS error:', { key, error });
            return false;
        }
    }
    /**
     * Set expiration time for a key
     */
    static async expire(key, seconds) {
        if (!this.connected) {
            return false;
        }
        try {
            const result = await this.client.expire(key, seconds);
            return result;
        }
        catch (error) {
            logger.error('Redis EXPIRE error:', { key, seconds, error });
            return false;
        }
    }
    /**
     * Get TTL for a key
     */
    static async ttl(key) {
        if (!this.connected) {
            return -1;
        }
        try {
            return await this.client.ttl(key);
        }
        catch (error) {
            logger.error('Redis TTL error:', { key, error });
            return -1;
        }
    }
    /**
     * Increment a numeric value
     */
    static async incr(key) {
        if (!this.connected) {
            return null;
        }
        try {
            return await this.client.incr(key);
        }
        catch (error) {
            logger.error('Redis INCR error:', { key, error });
            return null;
        }
    }
    /**
     * Increment by a specific amount
     */
    static async incrBy(key, increment) {
        if (!this.connected) {
            return null;
        }
        try {
            return await this.client.incrBy(key, increment);
        }
        catch (error) {
            logger.error('Redis INCRBY error:', { key, increment, error });
            return null;
        }
    }
    /**
     * Get multiple keys at once
     */
    static async mget(keys) {
        if (!this.connected || keys.length === 0) {
            return [];
        }
        try {
            const values = await this.client.mGet(keys);
            return values.map(value => {
                if (value === null)
                    return null;
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value;
                }
            });
        }
        catch (error) {
            logger.error('Redis MGET error:', { keys, error });
            return keys.map(() => null);
        }
    }
    /**
     * Set multiple key-value pairs
     */
    static async mset(keyValues) {
        if (!this.connected || Object.keys(keyValues).length === 0) {
            return false;
        }
        try {
            const serialized = {};
            for (const [key, value] of Object.entries(keyValues)) {
                serialized[key] = typeof value === 'string' ? value : JSON.stringify(value);
            }
            await this.client.mSet(serialized);
            return true;
        }
        catch (error) {
            logger.error('Redis MSET error:', { keyValues, error });
            return false;
        }
    }
    /**
     * Find keys matching a pattern
     */
    static async keys(pattern) {
        if (!this.connected) {
            return [];
        }
        try {
            return await this.client.keys(pattern);
        }
        catch (error) {
            logger.error('Redis KEYS error:', { pattern, error });
            return [];
        }
    }
    /**
     * Delete keys matching a pattern
     */
    static async deletePattern(pattern) {
        if (!this.connected) {
            return 0;
        }
        try {
            const keys = await this.keys(pattern);
            if (keys.length === 0)
                return 0;
            return await this.delMultiple(keys);
        }
        catch (error) {
            logger.error('Redis DELETE PATTERN error:', { pattern, error });
            return 0;
        }
    }
    /**
     * Flush all data from current database
     */
    static async flushdb() {
        if (!this.connected) {
            return false;
        }
        try {
            await this.client.flushDb();
            logger.info('Redis database flushed');
            return true;
        }
        catch (error) {
            logger.error('Redis FLUSHDB error:', error);
            return false;
        }
    }
    /**
     * Get Redis server info
     */
    static async info() {
        if (!this.connected) {
            return null;
        }
        try {
            return await this.client.info();
        }
        catch (error) {
            logger.error('Redis INFO error:', error);
            return null;
        }
    }
    /**
     * Get cache statistics
     */
    static async getStats() {
        if (!this.connected) {
            return {
                connected: false,
                keys: 0,
                memory_usage: '0B',
                uptime: 0,
                version: 'unknown'
            };
        }
        try {
            const info = await this.info();
            if (!info)
                return null;
            // Parse Redis info
            const lines = info.split('\r\n');
            const stats = {};
            for (const line of lines) {
                if (line.includes(':')) {
                    const [key, value] = line.split(':');
                    stats[key] = value;
                }
            }
            const dbKeys = await this.client.dbSize();
            return {
                connected: true,
                keys: dbKeys,
                memory_usage: stats.used_memory_human || '0B',
                uptime: parseInt(stats.uptime_in_seconds || '0'),
                version: stats.redis_version || 'unknown'
            };
        }
        catch (error) {
            logger.error('Redis STATS error:', error);
            return null;
        }
    }
    /**
     * Close Redis connection
     */
    static async close() {
        if (this.client) {
            try {
                await this.client.quit();
                this.client = null;
                this.isConnected = false;
                logger.info('Redis connection closed successfully');
            }
            catch (error) {
                logger.error('Error closing Redis connection:', error);
            }
        }
    }
}
// Cache helper functions using the configured cache keys
export const cache = {
    /**
     * User session cache
     */
    user: {
        set: (userId, data, ttl) => RedisClient.set(cacheConfig.keys.user_session(userId), data, ttl),
        get: (userId) => RedisClient.get(cacheConfig.keys.user_session(userId)),
        del: (userId) => RedisClient.del(cacheConfig.keys.user_session(userId)),
    },
    /**
     * Course data cache
     */
    course: {
        set: (courseId, data, ttl) => RedisClient.set(cacheConfig.keys.course_data(courseId), data, ttl),
        get: (courseId) => RedisClient.get(cacheConfig.keys.course_data(courseId)),
        del: (courseId) => RedisClient.del(cacheConfig.keys.course_data(courseId)),
    },
    /**
     * Enrollment cache
     */
    enrollment: {
        set: (userId, courseId, data, ttl) => RedisClient.set(cacheConfig.keys.enrollment_data(userId, courseId), data, ttl),
        get: (userId, courseId) => RedisClient.get(cacheConfig.keys.enrollment_data(userId, courseId)),
        del: (userId, courseId) => RedisClient.del(cacheConfig.keys.enrollment_data(userId, courseId)),
    },
    /**
     * Progress cache
     */
    progress: {
        set: (userId, courseId, data, ttl) => RedisClient.set(cacheConfig.keys.progress_data(userId, courseId), data, ttl),
        get: (userId, courseId) => RedisClient.get(cacheConfig.keys.progress_data(userId, courseId)),
        del: (userId, courseId) => RedisClient.del(cacheConfig.keys.progress_data(userId, courseId)),
    },
    /**
     * Quiz results cache
     */
    quiz: {
        set: (userId, quizId, data, ttl) => RedisClient.set(cacheConfig.keys.quiz_results(userId, quizId), data, ttl),
        get: (userId, quizId) => RedisClient.get(cacheConfig.keys.quiz_results(userId, quizId)),
        del: (userId, quizId) => RedisClient.del(cacheConfig.keys.quiz_results(userId, quizId)),
    },
    /**
     * Analytics cache
     */
    analytics: {
        set: (type, timeframe, data, ttl) => RedisClient.set(cacheConfig.keys.analytics(type, timeframe), data, ttl),
        get: (type, timeframe) => RedisClient.get(cacheConfig.keys.analytics(type, timeframe)),
        del: (type, timeframe) => RedisClient.del(cacheConfig.keys.analytics(type, timeframe)),
    },
};
export default RedisClient;
//# sourceMappingURL=redis.js.map