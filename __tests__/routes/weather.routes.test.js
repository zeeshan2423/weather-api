const request = require('supertest');
const express = require('express');
const { validateCityParam } = require('../../utils/validation');
const weatherController = require('../../controllers/weather.controller');
const { ApiResponse, ApiError } = require('../../utils/response');

// Mock implementations
jest.mock('../../utils/validation', () => {
    const { ApiError } = require('../../utils/response'); // Required inside factory
    return {
      validateCityParam: jest.fn().mockImplementation((req, res, next) => {
        if (!req.query.city) {
          return next(new ApiError('City parameter is required', 400, 'VALIDATION_ERROR'));
        }
        
        // Sanitization logic
        req.query.city = req.query.city
          .trim()
          .replace(/,/g, '%2C')
          .replace(/%20/g, ' ');
          
        next();
      })
    };
  });

  jest.mock('../../controllers/weather.controller', () => {
    const { ApiResponse } = require('../../utils/response'); // Required inside factory
    return {
      getCurrentWeather: jest.fn().mockImplementation((req, res) => 
        res.status(200).json(new ApiResponse('Success', { city: req.query.city }))
      )
    };
  });

describe('Weather Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/weather', require('../../routes/weather.routes'));
    app.use((err, req, res, next) => {
      res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message,
        errorCode: err.errorCode
      });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with valid city parameter', async () => {
    const response = await request(app)
      .get('/api/weather/current')
      .query({ city: 'London' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      message: 'Success',
      data: { city: 'London' }
    });
  });

  it('should sanitize city parameter', async () => {
    const response = await request(app)
      .get('/api/weather/current')
      .query({ city: '  New%20York,10001  ' });

    expect(response.body.data).toEqual({
      city: 'New York%2C10001' // Verify sanitization
    });
  });
});