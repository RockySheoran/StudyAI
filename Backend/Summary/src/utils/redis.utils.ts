import { redisClient } from '../config/redis';

export class RedisCache {
  /**
   * Set cache with expiration time
   */
  static async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      await redisClient.setEx(key, ttlSeconds, value);
    } catch (error) {
      console.error('Redis set error:', error);
      // Don't throw error, just log it to avoid breaking the main flow
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
}