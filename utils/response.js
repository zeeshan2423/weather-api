/**
 * Standardized response and error handling for API endpoints.
 * 
 * This module provides structured formats for success responses (ApiResponse)
 * and error responses (ApiError). It ensures consistency across all API
 * responses and simplifies error handling with built-in HTTP status codes
 * and machine-readable error codes.
 * 
 * @module response
 */

/**
 * Standardized success response format for all API endpoints.
 * @class ApiResponse
 * @property {string} status - Always set to 'success'
 * @property {string} message - Human-readable success message
 * @property {any} data - Optional payload data
 */
class ApiResponse {
  constructor(message, data = null) {
    this.status = 'success';
    this.message = message;
    this.data = data;
  }

  /**
   * Sends the response directly in an Express middleware chain.
   * @param {Object} res - Express response object
   * @param {number} [statusCode=200] - HTTP status code (default: 200)
   * @returns {Object} - Express response object with JSON payload
   */
  send(res, statusCode = 200) {
    return res.status(statusCode).json(this);
  }
}

/**
 * Structured error format for consistent error handling.
 * Extends native Error class to capture stack traces.
 * @class ApiError
 * @extends Error
 * @property {number} statusCode - HTTP status code for the error
 * @property {string} errorCode - Machine-readable error code
 */
class ApiError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {number} [statusCode=500] - HTTP status code (default: 500)
   * @param {string} [errorCode='SERVER_ERROR'] - Machine-readable error code (default: 'SERVER_ERROR')
   */
  constructor(message, statusCode = 500, errorCode = 'SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    
    // Capture stack trace for debugging (excluding constructor call)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { ApiResponse, ApiError };