const WeatherController = require('../../controllers/weather.controller');
const CacheService = require('../../services/cache.services');
const WeatherService = require('../../services/weather.services');
const { ApiResponse, ApiError } = require('../../utils/response');
const logger = require('../../utils/logger');

// Mock all dependencies
jest.mock('../../services/cache.services');
jest.mock('../../services/weather.services');
jest.mock('../../utils/logger');

describe('WeatherController', () => {
  let mockReq, mockRes, mockNext;

  // Sample weather data for testing
  const mockWeatherData = {
    city: 'London',
    temperature: 18.5,
    condition: 'Partly cloudy'
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create mock Express objects
    mockReq = {
      query: { city: 'London' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('getCurrentWeather()', () => {
    it('should return cached data when available', async () => {
      // Arrange
      CacheService.getCache.mockResolvedValue(mockWeatherData);

      // Act
      await WeatherController.getCurrentWeather(mockReq, mockRes, mockNext);

      // Assert
      expect(CacheService.getCache).toHaveBeenCalledWith('weather:London');
      expect(mockRes.json).toHaveBeenCalledWith(
        new ApiResponse('Cached weather data', mockWeatherData)
      );
      expect(WeatherService.fetchCurrentWeather).not.toHaveBeenCalled();
    });

    it('should fetch fresh data and cache it on cache miss', async () => {
      // Arrange
      CacheService.getCache.mockResolvedValue(null);
      WeatherService.fetchCurrentWeather.mockResolvedValue(mockWeatherData);

      // Act
      await WeatherController.getCurrentWeather(mockReq, mockRes, mockNext);

      // Assert
      expect(CacheService.setCache).toHaveBeenCalledWith(
        'weather:London',
        mockWeatherData,
        900
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        new ApiResponse('Current weather data', mockWeatherData)
      );
    });

    it('should handle API errors and propagate them', async () => {
      // Arrange
      CacheService.getCache.mockResolvedValue(null);
      const mockError = new ApiError('API Failure', 500);
      WeatherService.fetchCurrentWeather.mockRejectedValue(mockError);

      // Act
      await WeatherController.getCurrentWeather(mockReq, mockRes, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(logger.error).toHaveBeenCalledWith(
        'Weather fetch failed for city: London',
        { stack: mockError.stack }
      );
    });
  });
  

  afterAll(async () => {
    jest.restoreAllMocks();
  });
});