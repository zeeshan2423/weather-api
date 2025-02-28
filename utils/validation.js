/**
 * Middleware for validating the "city" query parameter in API requests.
 * 
 * This middleware ensures that the "city" parameter is present, is a valid
 * string, and is sanitized for URL safety. It throws an ApiError if validation
 * fails, ensuring consistent error handling across the application.
 * 
 * @module validation
 * @requires ./response - ApiError class for structured error handling
 */

const { ApiError } = require('./response');

/**
 * Middleware to validate the presence/format of the "city" query parameter.
 * @function validateCityParam
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {ApiError} - If city is missing or invalid
 */
const validateCityParam = (req, res, next) => {
  const { city } = req.query;

  // Check if city exists and is a non-empty string
  if (!city || typeof city !== 'string' || city.trim() === '') {
    return next(
      new ApiError(
        'City parameter is required (e.g., "London" or "48.8566,2.3522")',
        400,
        'VALIDATION_ERROR'
      )
    );
  }

  // Sanitize: Trim whitespace and encode for URL safety
  req.query.city = city.trim().replace(/,/g, '%2C'); // Encode commas in coordinates

  next();
};

module.exports = { validateCityParam };