/**
 * Health Check Routes
 * 
 * This file defines the routes for health check endpoints.
 * These endpoints are used to monitor the status of the application
 * and its dependencies (e.g., Redis, WeatherAPI).
 */

const express = require('express');
const router = express.Router();
const HealthController = require('../controllers/health.controller');

/**
 * GET /api/health
 * 
 * Health check endpoint to verify the status of the application and its dependencies.
 * - Checks Redis connectivity.
 * - Checks WeatherAPI connectivity.
 * 
 * @returns {Object} Response with the status of the app, Redis, and WeatherAPI.
 */
router.get('/', async (req, res, next) => {
  try {
    await HealthController.getHealthStatus(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;