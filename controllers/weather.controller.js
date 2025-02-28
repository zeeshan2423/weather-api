/**
 * Weather Controller
 * 
 * Handles weather data operations, including cache management and external API integration.
 * Implements caching strategies to reduce load on WeatherAPI and improve response times.
 */
const WeatherService = require('../services/weather.services');
const CacheService = require('../services/cache.services');
const { ApiResponse, ApiError } = require('../utils/response');
const logger = require('../utils/logger');

class WeatherController {
  /**
   * Fetches current weather data for a city.
   * Prioritizes cached data to reduce external API calls.
   * @param {Request} req - Express request object with `city` query parameter.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * @returns {void} Sends JSON response with weather data or error.
   */
  static async getCurrentWeather(req, res, next) {
    const { city } = req.query;
    
    try {
      logger.debug(`Fetching weather data for city: ${city}`);
      
      // 1. Cache Check
      const cacheKey = `weather:${city}`;
      const cachedData = await CacheService.getCache(cacheKey);
      
      if (cachedData) {
        logger.info(`Cache hit for city: ${city}`);
        return res
          .status(200)
          .json(new ApiResponse('Cached weather data', cachedData));
      }

      // 2. External API Call (Cache Miss)
      logger.debug(`Cache miss - fetching from WeatherAPI for city: ${city}`);
      const weatherData = await WeatherService.fetchCurrentWeather(city);
      
      // 3. Cache Update (15 minutes TTL)
      await CacheService.setCache(cacheKey, weatherData, 900); // 900 seconds = 15 minutes
      logger.info(`Data cached for city: ${city}`);

      // 4. Send Response
      res
        .status(200)
        .json(new ApiResponse('Current weather data', weatherData));

    } catch (error) {
      logger.error(`Weather fetch failed for city: ${city}`, { stack: error.stack });
      
      // Propagate error to central error handler
      next(new ApiError(
        error.message || 'Failed to fetch weather data',
        error.statusCode || 500,
        'WEATHER_FETCH_ERROR'
      ));
    }
  }
}

module.exports = WeatherController;