const express = require('express');
const request = require('supertest');
const rateLimiter  = require('../../middlewares/rate-limiter.middleware');
const errorHandler = require('../../middlewares/error-handler.middleware');
const { ApiError } = require('../../utils/response');

// Mock environment variables and Date
jest.mock('../../config/env', () => ({
  rateLimit: {
    windowMs: 5000, // 5 second window for testing
    max: 2 // 2 requests per window
  }
}));

describe('Rate Limiter Middleware', () => {
  let app;
  let mockRouteHandler;

  beforeEach(() => {
    // Mock Date and timers
    jest.useFakeTimers('modern');
    jest.setSystemTime(0); // Reset system time to epoch

    app = express();
    mockRouteHandler = jest.fn((req, res) => res.status(200).send('OK'));
    
    // Configure middleware chain
    app.use(rateLimiter);
    app.get('/test-route', mockRouteHandler);
    app.use(errorHandler); // Format error responses
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should allow requests under the limit', async () => {
    await request(app).get('/test-route').expect(200);
    await request(app).get('/test-route').expect(200);
    expect(mockRouteHandler).toHaveBeenCalledTimes(2);
  });

  it('should block requests over the limit', async () => {
    // First two requests
    await request(app).get('/test-route');
    await request(app).get('/test-route');
    
    // Third request (over limit)
    const response = await request(app).get('/test-route');
    
    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      status: 'error',
      message: 'Too many requests - please try again later.',
      errorCode: 'RATE_LIMIT_EXCEEDED'
    });
  });

  it('should reset the counter after window time', async () => {
    // Initial requests (2 allowed)
    await request(app).get('/test-route');
    await request(app).get('/test-route');
    await request(app).get('/test-route').expect(429); // Blocked

    // Advance time beyond window
    jest.advanceTimersByTime(5000);
    jest.setSystemTime(5000); // Update system time

    // New request in new window
    await request(app).get('/test-route').expect(200);
    expect(mockRouteHandler).toHaveBeenCalledTimes(1); // 2 initial + 1 new
  });
});