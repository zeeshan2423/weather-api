const axios = require('axios');
const WeatherService = require('../../services/weather.services');
const ApiError = require('../../utils/response').ApiError;
const logger = require('../../utils/logger');

// Mock axios and logger
jest.mock('axios');
jest.mock('../../utils/logger');

describe('WeatherService', () => {
  const mockCity = 'London';
  const mockWeatherData = {
    location: {
      name: 'London',
      region: 'City of London, Greater London',
      country: 'United Kingdom',
    },
    current: {
      temp_c: 15.0,
      condition: {
        text: 'Partly cloudy',
      },
      humidity: 75,
      wind_kph: 10.0,
      last_updated: '2023-10-05 12:00',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
  });

  describe('fetchCurrentWeather()', () => {
    it('should fetch and process weather data successfully', async () => {
      // Arrange
      axios.get.mockResolvedValue({ data: mockWeatherData });

      // Act
      const result = await WeatherService.fetchCurrentWeather(mockCity);

      // Assert
      expect(axios.get).toHaveBeenCalledWith(expect.any(String), {
        params: {
          key: expect.any(String),
          q: mockCity,
          aqi: 'no',
        },
      });
      expect(result).toEqual({
        city: mockWeatherData.location.name,
        region: mockWeatherData.location.region,
        country: mockWeatherData.location.country,
        temperature: mockWeatherData.current.temp_c,
        condition: mockWeatherData.current.condition.text,
        humidity: mockWeatherData.current.humidity,
        windSpeed: mockWeatherData.current.wind_kph,
        lastUpdated: mockWeatherData.current.last_updated,
      });
      expect(logger.debug).toHaveBeenCalledWith('Attempting API call...');
      expect(logger.info).toHaveBeenCalledWith('Data cached successfully');
    });

    it('should throw ApiError for invalid city input', async () => {
      // Arrange
      const mockErrorResponse = {
        data: {
          error: {
            message: 'No matching location found.',
          },
        },
      };
      axios.get.mockResolvedValue(mockErrorResponse);

      // Act & Assert
      await expect(WeatherService.fetchCurrentWeather('InvalidCity')).rejects.toThrow(
        new ApiError('No matching location found.', 400, 'WEATHER_API_ERROR')
      );
      expect(logger.error).toHaveBeenCalledWith('API failed', expect.any(Object));
    });

    it('should handle network errors', async () => {
      // Arrange
      const mockNetworkError = {
        request: {}, // Simulate no response received
      };
      axios.get.mockRejectedValue(mockNetworkError);

      // Act & Assert
      await expect(WeatherService.fetchCurrentWeather(mockCity)).rejects.toThrow(
        new ApiError('Weather service unreachable', 503, 'NETWORK_ERROR')
      );
      expect(logger.error).toHaveBeenCalledWith('API failed', expect.any(Object));
    });

    it('should handle API server errors (5xx)', async () => {
        // Arrange
        const mockServerError = {
          response: {
            status: 500,
            data: {
              error: {
                message: 'Internal server error',
              },
            },
          },
        };
        axios.get.mockRejectedValue(mockServerError);
      
        // Act & Assert
        await expect(WeatherService.fetchCurrentWeather(mockCity)).rejects.toThrow(
          new ApiError('Internal server error', 500, 'EXTERNAL_API_ERROR')
        );
        expect(logger.error).toHaveBeenCalledWith('API failed', expect.any(Object));
      });

    it('should handle unexpected errors', async () => {
      // Arrange
      const mockUnexpectedError = new Error('Unexpected error');
      axios.get.mockRejectedValue(mockUnexpectedError);

      // Act & Assert
      await expect(WeatherService.fetchCurrentWeather(mockCity)).rejects.toThrow(
        new ApiError('Unexpected error', 500, 'INTERNAL_ERROR')
      );
      expect(logger.error).toHaveBeenCalledWith('API failed', expect.any(Object));
    });
  });
});