import redisClient from '../config/redis';
import logger from '../utils/logger';

const CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds

export const getFromCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Cache get error for key ${key}:`, error);
    return null;
  }
};

export const setToCache = async (key: string, value: any, ttl = CACHE_TTL): Promise<void> => {
  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (error) {
    logger.error(`Cache set error for key ${key}:`, error);
  }
};

export const invalidateCache = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error(`Cache invalidation error for key ${key}:`, error);
  }
};