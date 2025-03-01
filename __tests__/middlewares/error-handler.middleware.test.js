const errorHandler = require('../../middlewares/error-handler.middleware');
const { ApiError } = require('../../utils/response');
const logger = require('../../utils/logger');

// Mock logger to test error logging
jest.mock('../../utils/logger');

describe('Error Handler Middleware', () => {
  let mockReq, mockRes, mockNext;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    process.env.NODE_ENV = 'test'; // Reset to test environment
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv; // Restore original NODE_ENV
  });

  it('should handle ApiError with custom status and message', () => {
    // Arrange
    const error = new ApiError('Not Found', 404, 'NOT_FOUND');
    
    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Not Found',
      errorCode: 'NOT_FOUND'
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle generic errors with 500 status', () => {
    // Arrange
    const error = new Error('Server Error');
    
    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Server Error',
      errorCode: 'SERVER_ERROR'
    });
  });

  it('should include stack trace in development environment', () => {
    // Arrange
    process.env.NODE_ENV = 'development';
    const error = new Error('Dev Error');
    
    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: expect.any(String)
      })
    );
  });

  it('should exclude stack trace in production environment', () => {
    // Arrange
    process.env.NODE_ENV = 'production';
    const error = new Error('Prod Error');
    
    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.not.objectContaining({
        stack: expect.any(String)
      })
    );
  });

  it('should use default message for unknown errors', () => {
    // Arrange
    const error = {};
    
    // Act
    errorHandler(error, mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Internal Server Error'
      })
    );
  });
});