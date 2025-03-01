const CacheService = require('../../services/cache.services');
const redisClient = require('../../config/redis');
const logger = require('../../utils/logger');

// Mock Redis client and logger
jest.mock('../../config/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  disconnect: jest.fn(),
}));
jest.mock('../../utils/logger');

describe('CacheService', () => {
  const mockData = { temp: 22.5 };
  const cacheKey = 'weather:London';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    redisClient.disconnect.mockResolvedValue();
  });

  describe('getCache()', () => {
    it('should return parsed data when cache exists', async () => {
      redisClient.get.mockResolvedValue(JSON.stringify(mockData));
      const result = await CacheService.getCache(cacheKey);
      expect(redisClient.get).toHaveBeenCalledWith(cacheKey);
      expect(result).toEqual(mockData);
    });

    it('should return null on cache miss', async () => {
      redisClient.get.mockResolvedValue(null);
      const result = await CacheService.getCache(cacheKey);
      expect(result).toBeNull();
      expect(redisClient.get).toHaveBeenCalledWith(cacheKey);
    });

    it('should handle cache read errors gracefully', async () => {
      redisClient.get.mockRejectedValue(new Error('Redis error'));
      const result = await CacheService.getCache(cacheKey);
      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith(
        'Cache read error:',
        { message: 'Redis error', stack: expect.any(String) }
      );
    });
  });

  describe('setCache()', () => {
    it('should store data with TTL successfully', async () => {
      await CacheService.setCache(cacheKey, mockData, 900);
      expect(redisClient.set).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(mockData),
        { EX: 900 }
      );
    });

    it('should handle cache write errors silently', async () => {
      redisClient.set.mockRejectedValue(new Error('Redis error'));
      await CacheService.setCache(cacheKey, mockData, 900);
      expect(logger.error).toHaveBeenCalledWith(
        'Cache write error:',
        { message: 'Redis error', stack: expect.any(String) }
      );
    });
  });
});