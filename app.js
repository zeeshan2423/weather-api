/**
 * Main entry point for the Weather API application.
 * This file sets up the Express server, configures middleware,
 * defines routes, and starts the server.
 */

// Import required modules
const express = require('express'); // Express framework for building the API
const helmet = require('helmet'); // Security middleware to set HTTP headers
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing (CORS)
const environment = require('./config/env'); // Environment configuration (e.g., port, Redis URL)
const redisClient = require('./config/redis'); // Redis client for caching (ensures Redis connection)
const rateLimiter = require('./middlewares/rate-limiter.middleware'); // Rate limiting middleware
const errorHandler = require('./middlewares/error-handler.middleware'); // Centralized error handling middleware
const weatherRoutes = require('./routes/weather.routes'); // Routes for weather-related endpoints
const healthRoutes = require('./routes/health.routes'); // Routes for health check endpoints

// Initialize Express application
const app = express();

// ======================
//      Middleware
// ======================

// Use Helmet to set security-related HTTP headers
app.use(helmet());

// Enable CORS to allow cross-origin requests
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Apply rate limiting to all routes to prevent abuse
app.use(rateLimiter);

// ======================
//        Routes
// ======================

// Mount weather-related routes under the `/api/weather` prefix
app.use('/api/weather', weatherRoutes);

// Mount health check routes under the `/api/health` prefix
app.use('/api/health', healthRoutes);

// ======================
//   Error Handling
// ======================

// Centralized error handling middleware
// This must be the last middleware to catch any unhandled errors
app.use(errorHandler);

// ======================
//     Start Server
// ======================

// Start the server and listen on the configured port
app.listen(environment.port, () => {
  console.log(
    `Server running on port http://localhost:${environment.port} (${environment.nodeEnv} mode)`
  );
});