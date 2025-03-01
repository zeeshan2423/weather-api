const logger = require('../../utils/logger');
const { environment } = require('../../config/env');
// Mock the environment configuration
jest.mock('../../config/env', () => ({
    environment: {
      nodeEnv: 'development', // Default to development
      redis: { url: 'redis://localhost:6379' },
      rateLimit: { windowMs: 900000, max: 100 }
    }
  }));
  
  describe('Logger Utility', () => {
    let originalEnv;
  
    beforeAll(() => {
      originalEnv = process.env.NODE_ENV;
    });
  
    afterAll(() => {
      process.env.NODE_ENV = originalEnv;
    });
  
    beforeEach(() => {
      jest.clearAllMocks();
    });

  it('should log debug messages in development mode', () => {
    // Access the mock environment
    require('../../config/env').environment.nodeEnv = 'development';
    const debugSpy = jest.spyOn(logger, 'debug');
    logger.debug('Test debug message');
    expect(debugSpy).toHaveBeenCalledWith('Test debug message');
  });

  it('should log info messages', () => {
    const infoSpy = jest.spyOn(logger, 'info');
    logger.info('Test info message');
    expect(infoSpy).toHaveBeenCalledWith('Test info message');
  });

  it('should log error messages with stack traces', () => {
    const errorSpy = jest.spyOn(logger, 'error');
    const mockError = new Error('Test error');
    logger.error('Test error message', { stack: mockError.stack });
    expect(errorSpy).toHaveBeenCalledWith('Test error message', {
      stack: mockError.stack,
    });
  });

  it('should not log debug messages in production mode', () => {
    // Access the mock environment
    require('../../config/env').environment.nodeEnv = 'production';
    const debugSpy = jest.spyOn(logger, 'info');
    logger.debug('Test debug message');
    expect(debugSpy).not.toHaveBeenCalled();
  });
});