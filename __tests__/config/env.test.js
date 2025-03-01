const originalEnv = process.env;
const originalDotenv = jest.requireActual('dotenv');

jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('Environment Configuration', () => {
    // List of variables that are TRULY required (without defaults)
    const trulyRequiredVars = [
      'WEATHERAPI_API_KEY',
      'WEATHERAPI_BASE_URL',
      'REDIS_URL',
      'RATE_LIMIT_WINDOW_MS',
      'RATE_LIMIT_MAX'
    ];
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      PORT: 4000,
      WEATHERAPI_API_KEY: 'test-api-key',
      WEATHERAPI_BASE_URL: 'https://api.weatherapi.com/v1',
      REDIS_URL: 'redis://localhost:6379',
      RATE_LIMIT_WINDOW_MS: '60000',
      RATE_LIMIT_MAX: '100',
      NODE_ENV: 'test'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  test('should load dotenv configuration', () => {
    require('../../config/env');
    const dotenv = require('dotenv');
    expect(dotenv.config).toHaveBeenCalled();
  });

  describe('Required Environment Variables', () => {
    trulyRequiredVars.forEach(varName => {
      test(`should throw error when ${varName} is missing`, () => {
        delete process.env[varName];
        expect(() => {
          jest.isolateModules(() => {
            require('../../config/env');
          });
        }).toThrowError(`Missing required environment variable: ${varName}`);
      });
    });

    test('should NOT throw error when optional PORT is missing', () => {
      delete process.env.PORT;
      expect(() => {
        jest.isolateModules(() => {
          require('../../config/env');
        });
      }).not.toThrow();
    });
  });

  describe('Configuration Export', () => {
    let envConfig;

    beforeEach(() => {
      envConfig = require('../../config/env');
    });

    test('should set port from environment', () => {
      expect(envConfig.port).toBe(4000);
    });

    test('should use default port when not provided', () => {
      delete process.env.PORT;
      jest.isolateModules(() => {
        envConfig = require('../../config/env');
        expect(envConfig.port).toBe(3000);
      });
    });

    test('should set node environment', () => {
      expect(envConfig.nodeEnv).toBe('test');
    });

    test('should use development as default node environment', () => {
      delete process.env.NODE_ENV;
      jest.isolateModules(() => {
        envConfig = require('../../config/env');
        expect(envConfig.nodeEnv).toBe('development');
      });
    });

    test('should configure weather API settings', () => {
      expect(envConfig.weatherApi).toEqual({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.weatherapi.com/v1'
      });
    });

    test('should configure Redis settings', () => {
      expect(envConfig.redis).toEqual({
        url: 'redis://localhost:6379'
      });
    });

    test('should parse rate limit settings as numbers', () => {
      expect(envConfig.rateLimit).toEqual({
        windowMs: 60000,
        max: 100
      });
    });

    test('should handle numeric environment variables', () => {
      process.env.RATE_LIMIT_WINDOW_MS = 'invalid';
      jest.isolateModules(() => {
        envConfig = require('../../config/env');
        expect(envConfig.rateLimit.windowMs).toBeNaN();
      });
    });
  });

  test('should not throw error when all required vars are present', () => {
    expect(() => require('../../config/env')).not.toThrow();
  });
});