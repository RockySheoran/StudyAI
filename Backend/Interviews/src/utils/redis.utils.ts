import { redisClient } from '../config/redis';

export class RedisCache {
  // Cache data for 1 hour (3600 seconds)
  private static readonly ONE_HOUR = 3600;

  /**
   * Set cache with 1 hour expiration
   */
  static async set(key: string, value: string): Promise<void> {
    try {
      await redisClient.setEx(key, this.ONE_HOUR, value);
    } catch (error) {
      console.error('Redis set error:', error);
      throw error;
    }
  }

  /**
   * Get cached data
   */
  static async get(key: string): Promise<string | null> {
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Delete specific cache
   */
  static async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  /**
   * Get remaining time to live for a key
   */
  static async getTTL(key: string): Promise<number> {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      console.error('Redis TTL error:', error);
      return -1;
    }
  }

  /**
   * Clear all cache (use carefully)
   */
  static async clearAll(): Promise<void> {
    try {
      await redisClient.flushAll();
    } catch (error) {
      console.error('Redis clear all error:', error);
    }
  }
}