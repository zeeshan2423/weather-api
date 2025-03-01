const { validateCityParam } = require('../../utils/validation');
const { ApiError } = require('../../utils/response');

describe('Validation Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { query: {} };
    mockRes = {};
    mockNext = jest.fn();
  });

  // ---- Valid Cases ----
  it('should pass validation for valid city string', () => {
    mockReq.query.city = ' London '; // With whitespace
    validateCityParam(mockReq, mockRes, mockNext);

    // Should trim and encode
    expect(mockReq.query.city).toBe('London');
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should pass validation for coordinates', () => {
    mockReq.query.city = '51.5074,  -0.1278'; // With whitespace
    validateCityParam(mockReq, mockRes, mockNext);

    // Should encode commas and spaces
    expect(mockReq.query.city).toBe('51.5074%2C%20-0.1278');
    expect(mockNext).toHaveBeenCalledWith();
  });

  // ---- Invalid Cases ----
  it('should reject empty city parameter', () => {
    mockReq.query.city = '';
    validateCityParam(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'City parameter is required (e.g., "London" or "48.8566,2.3522")',
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR'
      })
    );
  });

  it('should reject missing city parameter', () => {
    validateCityParam(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'City parameter is required (e.g., "London" or "48.8566,2.3522")',
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR'
      })
    );
  });

  it('should reject non-string city parameter', () => {
    mockReq.query.city = 12345; // Numbers are invalid
    validateCityParam(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'City parameter is required (e.g., "London" or "48.8566,2.3522")',
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR'
      })
    );
  });
});