// Complete test file
const request = require('supertest');
const express = require('express');
const HealthController = require('../../controllers/health.controller');

jest.mock('../../controllers/health.controller');

describe('Health Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/health', require('../../routes/health.routes'));
  });

  beforeEach(() => {
    HealthController.getHealthStatus.mockImplementation(async (req, res) => {
      res.json({
        status: 'success',
        message: 'Service status',
        data: {
          app: true,
          redis: true,
          weatherApi: true
        }
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const testCases = [
    { 
      name: 'all services healthy',
      mockData: { app: true, redis: true, weatherApi: true },
      status: 200
    },
    {
      name: 'WeatherAPI down',
      mockData: { app: false, redis: true, weatherApi: false },
      status: 200
    },
    {
      name: 'Redis down',
      mockData: { app: true, redis: false, weatherApi: true },
      status: 200
    },
    {
      name: 'all services down',
      mockData: { app: false, redis: false, weatherApi: false },
      status: 200
    }
  ];

  testCases.forEach(({ name, mockData, status }) => {
    it(`should return ${status} when ${name}`, async () => {
      HealthController.getHealthStatus.mockImplementationOnce(async (req, res) => {
        res.status(status).json({
          status: 'success',
          message: 'Service status',
          data: mockData
        });
      });

      const response = await request(app).get('/api/health');
      expect(response.status).toBe(status);
      expect(response.body.data).toEqual(mockData);
    });
  });
}, 15000); // Global timeout of 15 seconds