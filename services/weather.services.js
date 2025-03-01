const axios = require('axios');
const { weatherApi } = require('../config/env');
const ApiError = require('../utils/response').ApiError;
const logger = require('../utils/logger');

class WeatherService {
  /**
   * Fetches current weather data from WeatherAPI.com
   * @param {string} city - City name or coordinates (e.g., "London" or "48.8566,2.3522")
   * @returns {Promise<object>} Processed weather data
   * @throws {ApiError} Propagates API errors or network issues
   */
  static async fetchCurrentWeather(city) {
    try {
        logger.debug('Attempting API call...');
      const apiUrl = `${weatherApi.baseUrl}/current.json`;
      
    const encodedCity = encodeURIComponent(city);
      const response = await axios.get(apiUrl, {
        params: {
          key: weatherApi.apiKey,
          q: encodedCity,
          aqi: 'no' // Exclude air quality data to simplify response
        }
      });

      // Check for API-level errors (WeatherAPI returns 200 even for invalid cities)
      if (response.data.error) {
        throw new ApiError(
          response.data.error.message || 'WeatherAPI request failed',
          400,
          'WEATHER_API_ERROR'
        );
      }

      logger.info('Data cached successfully');
      // Extract and format relevant data
      return {
        city: response.data.location.name,
        region: response.data.location.region,
        country: response.data.location.country,
        temperature: response.data.current.temp_c,
        condition: response.data.current.condition.text,
        humidity: response.data.current.humidity,
        windSpeed: response.data.current.wind_kph,
        lastUpdated: response.data.current.last_updated
      };

    } catch (error) {
        logger.error('API failed', { stack: error.stack });
      // Handle axios errors (network, timeout) or rethrow structured ApiError
      if (error.response) {
        // WeatherAPI returned 4xx/5xx status
        throw new ApiError(
          error.response.data.error?.message || 'Weather service unavailable',
          error.response.status,
          'EXTERNAL_API_ERROR'
        );
      } else if (error.request) {
        // No response received (network issue)
        throw new ApiError('Weather service unreachable', 503, 'NETWORK_ERROR');
      } else {
        // Programming error
        throw new ApiError(error.message, 500, 'INTERNAL_ERROR');
      }
      
    }
  }
}

module.exports = WeatherService;