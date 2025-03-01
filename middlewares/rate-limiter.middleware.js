
const rateLimit = require('express-rate-limit');
const { rateLimit: config } = require('../config/env');
const { ApiError } = require('../utils/response');

// Create rate limiter middleware
const rateLimiter  = rateLimit({

  windowMs: config.windowMs, // 15 minutes
  max: config.max, // 100 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable deprecated `X-RateLimit-*` headers
  handler: (req, res, next) => {
    next(new ApiError(
      'Too many requests - please try again later.',
      429,
      'RATE_LIMIT_EXCEEDED'
    ));
  }
});

module.exports = rateLimiter ;