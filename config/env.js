/**
 * Environment configuration and validation module.
 * 
 * Centralizes management of environment variables with validation and type conversion.
 * Ensures required variables are present and provides structured access to configuration.
 * 
 * @module config/env
 * @requires dotenv - Environment variable loader
 * @throws {Error} If any required environment variables are missing
 */

const dotenv = require('dotenv');

// Load environment variables from .env.development file
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'PORT',
  'WEATHERAPI_API_KEY',
  'WEATHERAPI_BASE_URL',
  'REDIS_URL',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

// Export environment variables
module.exports = {
  /**
   * Server port number (default: 3000)
   * @type {number}
   */
  port: process.env.PORT || 3000,

  /**
   * Node.js environment context (default: 'development')
   * @type {string}
   */
  nodeEnv: process.env.NODE_ENV || 'development',

  /**
   * Weather API configuration
   * @type {Object}
   * @property {string} apiKey - Authentication key for weather service
   * @property {string} baseUrl - Base URL for weather API endpoints
   */
  weatherApi: {
    apiKey: process.env.WEATHERAPI_API_KEY,
    baseUrl: process.env.WEATHERAPI_BASE_URL,
  },

  /**
   * Redis connection configuration
   * @type {Object}
   * @property {string} url - Redis connection URL
   */
  redis: {
    url: process.env.REDIS_URL,
  },

  /**
   * Rate limiting configuration
   * @type {Object}
   * @property {number} windowMs - Time window in milliseconds
   * @property {number} max - Maximum allowed requests per window
   */
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10),
    max: parseInt(process.env.RATE_LIMIT_MAX, 10),
  },
};