import { AppError } from '@/lib/error';

describe('AppError', () => {
  it('creates error with correct properties', () => {
    const error = new AppError('Test error', 'TEST_ERROR', 400);
    
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.status).toBe(400);
  });
}); 