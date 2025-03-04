import { AppError, handleApiError, type ApiErrorResponse } from '@/lib/error';

describe('AppError', () => {
  it('creates error with correct properties', () => {
    const error = new AppError('Test error', 'TEST_ERROR', 400);
    
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.status).toBe(400);
  });
});

describe('Error Handler', () => {
  it('should handle API errors', () => {
    const error = new AppError('Test error', 'TEST_ERROR', 400);
    const result: ApiErrorResponse = handleApiError(error);
    
    expect(result.message).toBe('Test error');
    expect(result.status).toBe(400);
    expect(result.code).toBe('TEST_ERROR');
  });

  it('should handle standard errors', () => {
    const error = new Error('Standard error');
    const result: ApiErrorResponse = handleApiError(error);
    
    expect(result.message).toBe('Standard error');
    expect(result.status).toBe(500);
  });

  it('should handle unknown errors', () => {
    const result: ApiErrorResponse = handleApiError('Unknown error');
    
    expect(result.message).toBe('An unknown error occurred');
    expect(result.status).toBe(500);
  });
}); 