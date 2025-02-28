/**
 * Weather Routes
 * 
 * This file defines the routes for weather-related endpoints.
 * These endpoints allow users to fetch current weather data for a specified city.
 */

const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weather.controller');
const { validateCityParam } = require('../utils/validation');

/**
 * GET /api/weather/current?city={city}
 * 
 * Fetches the current weather data for a specified city.
 * - Validates the "city" query parameter using the `validateCityParam` middleware.
 * - Returns cached data if available; otherwise, fetches fresh data from WeatherAPI.
 * 
 * @param {string} city - The city name or coordinates (e.g., "London" or "48.8566,2.3522").
 * @returns {Object} Response with the current weather data for the specified city.
 */
router.get(
  '/current',
  validateCityParam, // Middleware to validate the "city" query parameter
  weatherController.getCurrentWeather
);

module.exports = router;