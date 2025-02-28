/**
 * Cache Service
 * 
 * Handles Redis-based caching operations for the application.
 * Provides methods to store and retrieve data from Redis with TTL (Time-To-Live) support.
 */
const redisClient = require('../config/redis');
const logger = require('../utils/logger');

class CacheService {
  /**
   * Retrieves cached data by key.
   * If the key exists, returns the parsed JSON data; otherwise, returns `null`.
   * @param {string} key - The Redis cache key (e.g., "weather:London").
   * @returns {Promise<object|null>} - Parsed cached data or `null` if the key doesn't exist.
   */
  static async getCache(key) {
    try {
      const cachedData = await redisClient.get(key);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      logger.error('Cache read error:', { message: error.message, stack: error.stack });
      return null; // Gracefully fail and allow the application to proceed
    }
  }

  /**
   * Stores data in Redis with a specified TTL (Time-To-Live).
   * @param {string} key - The Redis cache key (e.g., "weather:London").
   * @param {object} data - The data to cache (will be serialized to JSON).
   * @param {number} ttlSeconds - The expiration time in seconds.
   * @returns {Promise<void>}
   */
  static async setCache(key, data, ttlSeconds) {
    try {
      await redisClient.set(
        key,
        JSON.stringify(data), // Serialize data to JSON
        { EX: ttlSeconds } // Set expiration in seconds
      );
      logger.debug(`Data cached successfully for key: ${key}`);
    } catch (error) {
      logger.error('Cache write error:', { message: error.message, stack: error.stack });
      // Fail silently to avoid blocking the application
    }
  }
}

module.exports = CacheService;