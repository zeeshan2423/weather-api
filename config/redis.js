/**
 * Redis client configuration and connection management.
 * 
 * Establishes Redis connection with proper error handling and event logging.
 * Implements best practices for Redis client lifecycle management.
 * 
 * @module config/redis
 * @requires redis - Redis client library
 * @requires ./env - Environment configuration
 */

const { createClient } = require('redis');
const { redis: redisConfig } = require('./env');

/**
 * Redis client instance configured with environment variables.
 * @type {RedisClientType}
 */
const redisClient = createClient({
  url: redisConfig.url,
});

// Event listeners for connection lifecycle management
redisClient.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') { // Disable logs in tests
    console.log('Redis client connected');
  }
});

redisClient.on('error', (err) => {if (process.env.NODE_ENV !== 'test') {
  console.error('Redis connection error:', err);
}
});

redisClient.on('end', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('Redis client disconnected');
  }
});

// Immediately-invoked async function to establish connection
(async () => {
  await redisClient.connect();
})();

// Export both client and connection methods
module.exports = {
  redisClient,
  connect: async () => {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  },
  disconnect: async () => {
    if (redisClient.isOpen) {
      await redisClient.disconnect();
    }
  }
};