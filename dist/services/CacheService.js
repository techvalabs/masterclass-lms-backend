import { createClient } from 'redis';
import { logger } from '../utils/logger.js';
export class CacheService {
    static instance;
    client = null;
    isConnected = false;
    defaultTTL = 3600; // 1 hour default TTL
    constructor() { }
    static getInstance() {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }
    async connect() {
        try {
            this.client = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            logger.error('Redis: Max reconnection attempts reached');
                            return new Error('Max reconnection attempts reached');
                        }
                        return Math.min(retries * 100, 3000);
                    }
                }
            });
            this.client.on('error', (err) => {
                logger.error('Redis Client Error:', err);
                this.isConnected = false;
            });
            this.client.on('connect', () => {
                logger.info('Redis Client Connected');
                this.isConnected = true;
            });
            this.client.on('ready', () => {
                logger.info('Redis Client Ready');
                this.isConnected = true;
            });
            await this.client.connect();
        }
        catch (error) {
            logger.error('Failed to connect to Redis:', error);
            // Continue without cache if Redis is unavailable
            this.isConnected = false;
        }
    }
    async disconnect() {
        if (this.client) {
            await this.client.quit();
            this.isConnected = false;
        }
    }
    // Generic cache methods
    async get(key) {
        if (!this.isConnected || !this.client)
            return null;
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            logger.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }
    async set(key, value, ttl) {
        if (!this.isConnected || !this.client)
            return;
        try {
            const serialized = JSON.stringify(value);
            if (ttl) {
                await this.client.setEx(key, ttl, serialized);
            }
            else {
                await this.client.setEx(key, this.defaultTTL, serialized);
            }
        }
        catch (error) {
            logger.error(`Cache set error for key ${key}:`, error);
        }
    }
    async delete(key) {
        if (!this.isConnected || !this.client)
            return;
        try {
            await this.client.del(key);
        }
        catch (error) {
            logger.error(`Cache delete error for key ${key}:`, error);
        }
    }
    async flush() {
        if (!this.isConnected || !this.client)
            return;
        try {
            await this.client.flushAll();
        }
        catch (error) {
            logger.error('Cache flush error:', error);
        }
    }
    // Specific cache methods for different entities
    // Course caching
    async getCourse(courseId) {
        return this.get(`course:${courseId}`);
    }
    async setCourse(courseId, courseData, ttl = 1800) {
        await this.set(`course:${courseId}`, courseData, ttl);
    }
    async invalidateCourse(courseId) {
        await this.delete(`course:${courseId}`);
        await this.delete(`course:${courseId}:modules`);
        await this.delete(`course:${courseId}:lessons`);
    }
    // User caching
    async getUser(userId) {
        return this.get(`user:${userId}`);
    }
    async setUser(userId, userData, ttl = 900) {
        await this.set(`user:${userId}`, userData, ttl);
    }
    async invalidateUser(userId) {
        await this.delete(`user:${userId}`);
        await this.delete(`user:${userId}:enrollments`);
        await this.delete(`user:${userId}:progress`);
    }
    // Enrollment caching
    async getEnrollments(userId) {
        return this.get(`user:${userId}:enrollments`);
    }
    async setEnrollments(userId, enrollments, ttl = 600) {
        await this.set(`user:${userId}:enrollments`, enrollments, ttl);
    }
    // Progress caching
    async getProgress(userId, courseId) {
        return this.get(`progress:${userId}:${courseId}`);
    }
    async setProgress(userId, courseId, progress, ttl = 300) {
        await this.set(`progress:${userId}:${courseId}`, progress, ttl);
    }
    // Dashboard stats caching
    async getDashboardStats(userId) {
        return this.get(`dashboard:${userId}:stats`);
    }
    async setDashboardStats(userId, stats, ttl = 300) {
        await this.set(`dashboard:${userId}:stats`, stats, ttl);
    }
    // Analytics caching
    async getAnalytics(key) {
        return this.get(`analytics:${key}`);
    }
    async setAnalytics(key, data, ttl = 3600) {
        await this.set(`analytics:${key}`, data, ttl);
    }
    // Session management
    async getSession(sessionId) {
        return this.get(`session:${sessionId}`);
    }
    async setSession(sessionId, sessionData, ttl = 86400) {
        await this.set(`session:${sessionId}`, sessionData, ttl);
    }
    async deleteSession(sessionId) {
        await this.delete(`session:${sessionId}`);
    }
    // Rate limiting
    async incrementRateLimit(key, window = 60) {
        if (!this.isConnected || !this.client)
            return 0;
        try {
            const multi = this.client.multi();
            multi.incr(key);
            multi.expire(key, window);
            const results = await multi.exec();
            return results ? results[0] : 0;
        }
        catch (error) {
            logger.error(`Rate limit increment error for key ${key}:`, error);
            return 0;
        }
    }
    // Leaderboard functionality
    async updateLeaderboard(leaderboardKey, userId, score) {
        if (!this.isConnected || !this.client)
            return;
        try {
            await this.client.zAdd(leaderboardKey, {
                score,
                value: userId.toString()
            });
        }
        catch (error) {
            logger.error(`Leaderboard update error:`, error);
        }
    }
    async getLeaderboard(leaderboardKey, limit = 10) {
        if (!this.isConnected || !this.client)
            return [];
        try {
            const results = await this.client.zRangeWithScores(leaderboardKey, 0, limit - 1, {
                REV: true
            });
            return results;
        }
        catch (error) {
            logger.error(`Leaderboard fetch error:`, error);
            return [];
        }
    }
    // Cache warming strategies
    async warmCache() {
        if (!this.isConnected)
            return;
        logger.info('Starting cache warming...');
        // Warm popular courses
        // Warm trending content
        // Warm frequently accessed data
        logger.info('Cache warming completed');
    }
    // Health check
    async healthCheck() {
        if (!this.isConnected || !this.client)
            return false;
        try {
            await this.client.ping();
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
export const cacheService = CacheService.getInstance();
//# sourceMappingURL=CacheService.js.map