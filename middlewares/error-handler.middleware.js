const { ApiResponse } = require('../utils/response');
const environment = require('../config/env');

// Custom error handling middleware for Express
const errorHandler = (err, req, res, next) => {
  // Log the error stack in development
  if (environment.nodeEnv === 'development') {
    console.error('[Error Handler]', err.stack);
  }

  // Default error structure
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errorCode = err.errorCode || 'SERVER_ERROR';

  // Standardized error response format
  const errorResponse = {
    status: 'error',
    message,
    errorCode,
    ...(environment.nodeEnv === 'development' && { stack: err.stack }),
  };

  // Send response
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;