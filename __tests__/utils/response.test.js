const { ApiResponse, ApiError } = require('../../utils/response');

describe('Response Classes', () => {
  describe('ApiResponse', () => {
    it('should create a success response with data', () => {
      const response = new ApiResponse('Test message', { data: 'test' });
      expect(response).toEqual({
        status: 'success',
        message: 'Test message',
        data: { data: 'test' },
      });
    });

    it('should create a success response without data', () => {
      const response = new ApiResponse('Test message');
      expect(response).toEqual({
        status: 'success',
        message: 'Test message',
        data: null,
      });
    });
  });

  describe('ApiError', () => {
    it('should create an error with default status code', () => {
      const error = new ApiError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('SERVER_ERROR');
    });

    it('should create an error with custom status code and error code', () => {
      const error = new ApiError('Test error', 400, 'VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
    });
  });
});