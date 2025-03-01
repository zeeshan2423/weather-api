const { createClient } = require('redis');
const { redisClient, connect, disconnect } = require('../../config/redis');

// Mock redis and env properly
jest.mock('redis', () => {
  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    isOpen: false,
    on: jest.fn()
  };
  return {
    createClient: jest.fn(() => mockClient)
  };
});

jest.mock('../../config/env', () => ({
  redis: {
    url: 'redis://test:6379'
  }
}));

describe('Redis Configuration', () => {
  let originalEnv;

  beforeAll(() => {
    originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  test('should create client with correct configuration', () => {
    expect(createClient).toHaveBeenCalledWith({
      url: 'redis://test:6379'
    });
  });

  test('should register event handlers', () => {
    expect(redisClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(redisClient.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(redisClient.on).toHaveBeenCalledWith('end', expect.any(Function));
  });

  test('should not log connection events in test environment', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const consoleErrorSpy = jest.spyOn(console, 'error');
    
    // Trigger connection handlers
    const connectHandler = redisClient.on.mock.calls[0][1];
    const errorHandler = redisClient.on.mock.calls[1][1];
    const endHandler = redisClient.on.mock.calls[2][1];
    
    connectHandler();
    errorHandler(new Error('test error'));
    endHandler();

    expect(consoleSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('should automatically connect when module loads', () => {
    expect(redisClient.connect).toHaveBeenCalledTimes(1);
  });

  describe('Connection Methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('connect() should connect if not open', async () => {
      redisClient.isOpen = false;
      await connect();
      expect(redisClient.connect).toHaveBeenCalledTimes(1);
    });

    test('connect() should not connect if already open', async () => {
      redisClient.isOpen = true;
      await connect();
      expect(redisClient.connect).not.toHaveBeenCalled();
    });

    test('disconnect() should disconnect if open', async () => {
      redisClient.isOpen = true;
      await disconnect();
      expect(redisClient.disconnect).toHaveBeenCalledTimes(1);
    });

    test('disconnect() should not disconnect if not open', async () => {
      redisClient.isOpen = false;
      await disconnect();
      expect(redisClient.disconnect).not.toHaveBeenCalled();
    });
  });
});