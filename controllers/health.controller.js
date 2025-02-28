/**
 * Health Controller
 * 
 * Handles health check operations to monitor service dependencies and overall system status.
 * Performs connectivity checks for Redis and WeatherAPI, and aggregates results.
 */
const redisClient = require('../config/redis');
const axios = require('axios');
const { weatherApi } = require('../config/env');
const { ApiResponse } = require('../utils/response');

class HealthController {
  // Timeout for health checks (5 seconds) to prevent blocking indefinitely
  static HEALTH_CHECK_TIMEOUT = 5000;

  /**
   * Checks Redis connectivity by sending a PING command.
   * Fails if Redis doesn't respond within 5 seconds or returns an error.
   * @returns {Promise<boolean>} - `true` if Redis responds with PONG, `false` otherwise.
   */
  static async checkRedis() {
    try {
      const reply = await Promise.race([
        redisClient.ping(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Redis timeout')), this.HEALTH_CHECK_TIMEOUT))
      ]);
      return reply === 'PONG'; // Validate Redis response
    } catch (error) {
      return false; // Gracefully handle timeouts/errors
    }
  }

  /**
   * Checks WeatherAPI connectivity by fetching weather data for London.
   * Fails if the API doesn't respond within 5 seconds or returns an error.
   * @returns {Promise<boolean>} - `true` if API responds successfully, `false` otherwise.
   */
  static async checkWeatherApi() {
    try {
      await Promise.race([
        axios.get(`${weatherApi.baseUrl}/current.json`, {
          params: {
            key: weatherApi.apiKey,
            q: 'London', // Test with a stable city
            aqi: 'no' // Simplify response by excluding air quality data
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('WeatherAPI timeout')), this.HEALTH_CHECK_TIMEOUT))
      ]);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Health check endpoint handler.
   * Aggregates statuses from Redis and WeatherAPI checks.
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @returns {void} Sends JSON response with service statuses.
   */
  static async getHealthStatus(req, res) {
    const [redisStatus, weatherApiStatus] = await Promise.all([
      HealthController.checkRedis(),
      HealthController.checkWeatherApi()
    ]);

    // App is considered healthy only if WeatherAPI is reachable
    const appStatus = weatherApiStatus;

    new ApiResponse('Service status', {
      app: appStatus,
      redis: redisStatus,
      weatherApi: weatherApiStatus
    }).send(res);
  }
}

module.exports = HealthController;