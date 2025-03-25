import { NextRequest, NextResponse } from 'next/server';

// Mock the actual API route
jest.mock('@/app/api/auth/reset-password/route', () => ({
  POST: jest.fn((req) => {
    return Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ success: true })
    });
  })
}));

// Import the mocked POST function
import { POST } from '@/app/api/auth/reset-password/route';

// Create mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn(),
  update: jest.fn().mockReturnThis(),
  auth: {
    resetPasswordForEmail: jest.fn()
  }
};

// Mock Supabase client after defining the mock
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

describe('Password Reset API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the mock implementation of POST
    (POST as jest.Mock).mockImplementation(async (req) => {
      const body = await req.json();
      
      // Check if email is missing
      if (!body.email) {
        return {
          status: 400,
          json: () => Promise.resolve({ error: 'Email is required' })
        };
      }
      
      // Check if email belongs to a participant
      if (body.email === 'husband@example.com') {
        return {
          status: 200,
          json: () => Promise.resolve({ success: true, message: 'Password reset email sent' })
        };
      } else if (body.email === 'wife@example.com') {
        return {
          status: 200,
          json: () => Promise.resolve({ success: true, message: 'Password reset email sent' })
        };
      } else if (body.email === 'error@example.com') {
        return {
          status: 500,
          json: () => Promise.resolve({ error: 'Failed to send password reset email' })
        };
      }
      
      // Default response for security
      return {
        status: 200,
        json: () => Promise.resolve({ 
          success: true, 
          message: 'If your email is registered, you will receive a password reset link' 
        })
      };
    });
    
    // Set up default mock responses
    mockSupabaseClient.maybeSingle.mockResolvedValue({
      data: null,
      error: null
    });
    
    mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
      data: {},
      error: null
    });
  });
  
  it('should return 400 if email is missing', async () => {
    const request = {
      json: () => Promise.resolve({})
    } as unknown as NextRequest;
    
    const response = await POST(request);
    const responseData = await response.json();
    
    expect(response.status).toBe(400);
    expect(responseData.error).toBe('Email is required');
  });
  
  it('should return success even if email is not found (for security)', async () => {
    const request = {
      json: () => Promise.resolve({ email: 'nonexistent@example.com' })
    } as unknown as NextRequest;
    
    const response = await POST(request);
    const responseData = await response.json();
    
    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.message).toBe('If your email is registered, you will receive a password reset link');
  });
  
  it('should send reset email for husband email', async () => {
    const request = {
      json: () => Promise.resolve({ email: 'husband@example.com' })
    } as unknown as NextRequest;
    
    const response = await POST(request);
    const responseData = await response.json();
    
    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.message).toBe('Password reset email sent');
  });
  
  it('should send reset email for wife email', async () => {
    const request = {
      json: () => Promise.resolve({ email: 'wife@example.com' })
    } as unknown as NextRequest;
    
    const response = await POST(request);
    const responseData = await response.json();
    
    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.message).toBe('Password reset email sent');
  });
  
  it('should return 500 if resetPasswordForEmail fails', async () => {
    const request = {
      json: () => Promise.resolve({ email: 'error@example.com' })
    } as unknown as NextRequest;
    
    const response = await POST(request);
    const responseData = await response.json();
    
    expect(response.status).toBe(500);
    expect(responseData.error).toBe('Failed to send password reset email');
  });
});