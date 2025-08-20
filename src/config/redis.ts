import { createClient, RedisClientType } from 'redis';
import { logger } from '@/utils/logger.js';
import { config, cacheConfig } from '@/config/index.js';

/**
 * Redis Client Configuration and Management
 * Provides caching and session management capabilities
 */

export class RedisClient {
  private static client: RedisClientType | null = null;
  private static isConnected = false;

  /**
   * Initialize Redis connection
   */
  public static async initialize(): Promise<void> {
    try {
      // Create Redis client
      this.client = createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port,
          connectTimeout: 10000,
        },
        password: config.redis.password,
        database: config.redis.db,
        lazyConnect: true,
      } as any);

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

    } catch (error) {
      logger.warn('Redis initialization failed:', error);
      this.client = null;
      this.isConnected = false;
      // Don't throw error - Redis is optional
    }
  }

  /**
   * Get Redis client instance
   */
  public static getClient(): RedisClientType | null {
    return this.client;
  }

  /**
   * Check if Redis is connected
   */
  public static get connected(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Set a key-value pair with optional TTL
   */
  public static async set(
    key: string, 
    value: any, 
    ttlSeconds: number = cacheConfig.ttl
  ): Promise<boolean> {
    if (!this.connected) {
      logger.debug('Redis not connected, skipping set operation');
      return false;
    }

    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttlSeconds > 0) {
        await this.client!.setEx(key, ttlSeconds, serializedValue);
      } else {
        await this.client!.set(key, serializedValue);
      }
      
      return true;
    } catch (error) {
      logger.error('Redis SET error:', { key, error });
      return false;
    }
  }

  /**
   * Get a value by key
   */
  public static async get<T = any>(key: string): Promise<T | null> {
    if (!this.connected) {
      logger.debug('Redis not connected, skipping get operation');
      return null;
    }

    try {
      const value = await this.client!.get(key);
      
      if (value === null) {
        return null;
      }

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      logger.error('Redis GET error:', { key, error });
      return null;
    }
  }

  /**
   * Delete a key
   */
  public static async del(key: string): Promise<boolean> {
    if (!this.connected) {
      logger.debug('Redis not connected, skipping delete operation');
      return false;
    }

    try {
      const result = await this.client!.del(key);
      return result > 0;
    } catch (error) {
      logger.error('Redis DELETE error:', { key, error });
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  public static async delMultiple(keys: string[]): Promise<number> {
    if (!this.connected || keys.length === 0) {
      return 0;
    }

    try {
      return await this.client!.del(keys);
    } catch (error) {
      logger.error('Redis DELETE MULTIPLE error:', { keys, error });
      return 0;
    }
  }

  /**
   * Check if a key exists
   */
  public static async exists(key: string): Promise<boolean> {
    if (!this.connected) {
      return false;
    }

    try {
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', { key, error });
      return false;
    }
  }

  /**
   * Set expiration time for a key
   */
  public static async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.connected) {
      return false;
    }

    try {
      const result = await this.client!.expire(key, seconds);
      return result;
    } catch (error) {
      logger.error('Redis EXPIRE error:', { key, seconds, error });
      return false;
    }
  }

  /**
   * Get TTL for a key
   */
  public static async ttl(key: string): Promise<number> {
    if (!this.connected) {
      return -1;
    }

    try {
      return await this.client!.ttl(key);
    } catch (error) {
      logger.error('Redis TTL error:', { key, error });
      return -1;
    }
  }

  /**
   * Increment a numeric value
   */
  public static async incr(key: string): Promise<number | null> {
    if (!this.connected) {
      return null;
    }

    try {
      return await this.client!.incr(key);
    } catch (error) {
      logger.error('Redis INCR error:', { key, error });
      return null;
    }
  }

  /**
   * Increment by a specific amount
   */
  public static async incrBy(key: string, increment: number): Promise<number | null> {
    if (!this.connected) {
      return null;
    }

    try {
      return await this.client!.incrBy(key, increment);
    } catch (error) {
      logger.error('Redis INCRBY error:', { key, increment, error });
      return null;
    }
  }

  /**
   * Get multiple keys at once
   */
  public static async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    if (!this.connected || keys.length === 0) {
      return [];
    }

    try {
      const values = await this.client!.mGet(keys);
      
      return values.map(value => {
        if (value === null) return null;
        
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as T;
        }
      });
    } catch (error) {
      logger.error('Redis MGET error:', { keys, error });
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple key-value pairs
   */
  public static async mset(keyValues: Record<string, any>): Promise<boolean> {
    if (!this.connected || Object.keys(keyValues).length === 0) {
      return false;
    }

    try {
      const serialized: Record<string, string> = {};
      
      for (const [key, value] of Object.entries(keyValues)) {
        serialized[key] = typeof value === 'string' ? value : JSON.stringify(value);
      }
      
      await this.client!.mSet(serialized);
      return true;
    } catch (error) {
      logger.error('Redis MSET error:', { keyValues, error });
      return false;
    }
  }

  /**
   * Find keys matching a pattern
   */
  public static async keys(pattern: string): Promise<string[]> {
    if (!this.connected) {
      return [];
    }

    try {
      return await this.client!.keys(pattern);
    } catch (error) {
      logger.error('Redis KEYS error:', { pattern, error });
      return [];
    }
  }

  /**
   * Delete keys matching a pattern
   */
  public static async deletePattern(pattern: string): Promise<number> {
    if (!this.connected) {
      return 0;
    }

    try {
      const keys = await this.keys(pattern);
      if (keys.length === 0) return 0;
      
      return await this.delMultiple(keys);
    } catch (error) {
      logger.error('Redis DELETE PATTERN error:', { pattern, error });
      return 0;
    }
  }

  /**
   * Flush all data from current database
   */
  public static async flushdb(): Promise<boolean> {
    if (!this.connected) {
      return false;
    }

    try {
      await this.client!.flushDb();
      logger.info('Redis database flushed');
      return true;
    } catch (error) {
      logger.error('Redis FLUSHDB error:', error);
      return false;
    }
  }

  /**
   * Get Redis server info
   */
  public static async info(): Promise<string | null> {
    if (!this.connected) {
      return null;
    }

    try {
      return await this.client!.info();
    } catch (error) {
      logger.error('Redis INFO error:', error);
      return null;
    }
  }

  /**
   * Get cache statistics
   */
  public static async getStats(): Promise<{
    connected: boolean;
    keys: number;
    memory_usage: string;
    uptime: number;
    version: string;
  } | null> {
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
      if (!info) return null;

      // Parse Redis info
      const lines = info.split('\r\n');
      const stats: any = {};
      
      for (const line of lines) {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          stats[key] = value;
        }
      }

      const dbKeys = await this.client!.dbSize();

      return {
        connected: true,
        keys: dbKeys,
        memory_usage: stats.used_memory_human || '0B',
        uptime: parseInt(stats.uptime_in_seconds || '0'),
        version: stats.redis_version || 'unknown'
      };
    } catch (error) {
      logger.error('Redis STATS error:', error);
      return null;
    }
  }

  /**
   * Close Redis connection
   */
  public static async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        this.client = null;
        this.isConnected = false;
        logger.info('Redis connection closed successfully');
      } catch (error) {
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
    set: (userId: string, data: any, ttl?: number) => 
      RedisClient.set(cacheConfig.keys.user_session(userId), data, ttl),
    get: <T = any>(userId: string) => 
      RedisClient.get<T>(cacheConfig.keys.user_session(userId)),
    del: (userId: string) => 
      RedisClient.del(cacheConfig.keys.user_session(userId)),
  },

  /**
   * Course data cache
   */
  course: {
    set: (courseId: string, data: any, ttl?: number) => 
      RedisClient.set(cacheConfig.keys.course_data(courseId), data, ttl),
    get: <T = any>(courseId: string) => 
      RedisClient.get<T>(cacheConfig.keys.course_data(courseId)),
    del: (courseId: string) => 
      RedisClient.del(cacheConfig.keys.course_data(courseId)),
  },

  /**
   * Enrollment cache
   */
  enrollment: {
    set: (userId: string, courseId: string, data: any, ttl?: number) => 
      RedisClient.set(cacheConfig.keys.enrollment_data(userId, courseId), data, ttl),
    get: <T = any>(userId: string, courseId: string) => 
      RedisClient.get<T>(cacheConfig.keys.enrollment_data(userId, courseId)),
    del: (userId: string, courseId: string) => 
      RedisClient.del(cacheConfig.keys.enrollment_data(userId, courseId)),
  },

  /**
   * Progress cache
   */
  progress: {
    set: (userId: string, courseId: string, data: any, ttl?: number) => 
      RedisClient.set(cacheConfig.keys.progress_data(userId, courseId), data, ttl),
    get: <T = any>(userId: string, courseId: string) => 
      RedisClient.get<T>(cacheConfig.keys.progress_data(userId, courseId)),
    del: (userId: string, courseId: string) => 
      RedisClient.del(cacheConfig.keys.progress_data(userId, courseId)),
  },

  /**
   * Quiz results cache
   */
  quiz: {
    set: (userId: string, quizId: string, data: any, ttl?: number) => 
      RedisClient.set(cacheConfig.keys.quiz_results(userId, quizId), data, ttl),
    get: <T = any>(userId: string, quizId: string) => 
      RedisClient.get<T>(cacheConfig.keys.quiz_results(userId, quizId)),
    del: (userId: string, quizId: string) => 
      RedisClient.del(cacheConfig.keys.quiz_results(userId, quizId)),
  },

  /**
   * Analytics cache
   */
  analytics: {
    set: (type: string, timeframe: string, data: any, ttl?: number) => 
      RedisClient.set(cacheConfig.keys.analytics(type, timeframe), data, ttl),
    get: <T = any>(type: string, timeframe: string) => 
      RedisClient.get<T>(cacheConfig.keys.analytics(type, timeframe)),
    del: (type: string, timeframe: string) => 
      RedisClient.del(cacheConfig.keys.analytics(type, timeframe)),
  },
};

export default RedisClient;