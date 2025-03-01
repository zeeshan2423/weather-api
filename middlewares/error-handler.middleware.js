const { ApiError } = require('../utils/response');
const environment = require('../config/env');
const logger = require('../utils/logger');

// Custom error handling middleware for Express
const errorHandler = (err, req, res, next) => {
  // Log the error stack in development
  if (environment.nodeEnv === 'development') {
    logger.error(err.message, { stack: err.stack });
  } else {
    logger.error(err.message);
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
  res.status(statusCode).json({
    status: 'error',
    message,
    errorCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;