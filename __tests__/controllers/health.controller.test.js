const HealthController = require('../../controllers/health.controller');
const { redisClient } = require('../../config/redis');
const axios = require('axios');

// Proper Redis client mock
jest.mock('../../config/redis', () => {
  const mockRedisClient = {
    ping: jest.fn().mockResolvedValue('PONG'), // Default mock behavior
    connect: jest.fn(),
    disconnect: jest.fn(),
    isOpen: true,
  };
  return {
    redisClient: mockRedisClient,
    connect: jest.fn(),
    disconnect: jest.fn(),
  };
});

jest.mock('axios');

describe('HealthController', () => {
  beforeAll(() => {
    // Mock logger if needed
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
    // Forcefully close any open handles
    redisClient.disconnect.mockImplementation(() => Promise.resolve());
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkRedis()', () => {
    it('should return true when Redis responds with PONG', async () => {
      // Arrange
      redisClient.ping.mockResolvedValue('PONG');

      // Act
      const result = await HealthController.checkRedis();

      // Assert
      expect(result).toBe(true);
      expect(redisClient.ping).toHaveBeenCalledTimes(1);
    });

    it('should return false on Redis timeout', async () => {
      // Arrange
      redisClient.ping.mockRejectedValue(new Error('Redis timeout'));

      // Act
      const result = await HealthController.checkRedis();

      // Assert
      expect(result).toBe(false);
      expect(redisClient.ping).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkWeatherApi()', () => {
    it('should return true when WeatherAPI responds successfully', async () => {
      // Arrange
      axios.get.mockResolvedValue({ data: {} });

      // Act
      const result = await HealthController.checkWeatherApi();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false on WeatherAPI timeout', async () => {
      // Arrange
      axios.get.mockRejectedValue(new Error('WeatherAPI timeout'));

      // Act
      const result = await HealthController.checkWeatherApi();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getHealthStatus()', () => {
    const mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    it('should return appStatus=true when both services are healthy', async () => {
      // Arrange
      jest.spyOn(HealthController, 'checkRedis').mockResolvedValue(true);
      jest.spyOn(HealthController, 'checkWeatherApi').mockResolvedValue(true);
      const res = mockResponse();

      // Act
      await HealthController.getHealthStatus({}, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            app: true,
            redis: true,
            weatherApi: true
          })
        })
      );
    });

    it('should return appStatus=false when WeatherAPI is down', async () => {
      // Arrange
      jest.spyOn(HealthController, 'checkRedis').mockResolvedValue(true);
      jest.spyOn(HealthController, 'checkWeatherApi').mockResolvedValue(false);
      const res = mockResponse();

      // Act
      await HealthController.getHealthStatus({}, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            app: false,
            redis: true,
            weatherApi: false
          })
        })
      );
    });
  });
});