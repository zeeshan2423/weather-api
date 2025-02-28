const rateLimit = require('express-rate-limit');
const { rateLimit: rateLimitConfig } = require('../config/env');

// Create rate limiter middleware
const limiter = rateLimit({
  windowMs: rateLimitConfig.windowMs, // 15 minutes
  max: rateLimitConfig.max, // 100 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable deprecated `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests - please try again later.',
  },
});

module.exports = limiter;