/**
 * Logger configuration using Winston for application-wide logging.
 * 
 * This module sets up a centralized logging system with customizable log levels,
 * colors, and formats. It handles both console logging and exceptions, with
 * environment-specific configurations (e.g., debug level in development, silent
 * logs during testing).
 * 
 * @module logger
 * @requires winston - Logging library for Node.js
 * @requires ../config/env - Environment configuration for log level settings
 */

const winston = require('winston');
const environment = require('../config/env');

// Define log levels and colors
const logLevels = { error: 0, warn: 1, info: 2, debug: 3 };
const logColors = { error: 'red', warn: 'yellow', info: 'green', debug: 'blue' };

// Configure logger format
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
    return stack ? log + '\n' + stack : log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  levels: logLevels,
  format: consoleFormat,
  transports: [
    
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ colors: logColors }),
      ),
      level: environment.nodeEnv === 'development' ? 'debug' : 'info'
    })
  ]
});

// Add exception handling for uncaught errors
logger.exceptions.handle(new winston.transports.Console());

// Silence logs during tests
if (environment.nodeEnv === 'test') {
  logger.transports.forEach(transport => {
    transport.silent = true;
  });
}

module.exports = logger;