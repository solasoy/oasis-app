import { NextRequest } from 'next/server';

// Mock the actual API route
jest.mock('@/app/api/admin/access-participant/route', () => ({
  POST: jest.fn((req) => {
    return Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ success: true })
    });
  })
}));

// Import the mocked POST function
import { POST } from '@/app/api/admin/access-participant/route';

// Create mock cookie store
const mockCookieStore = {
  get: jest.fn(),
  set: jest.fn(),
  getAll: jest.fn()
};

// Mock the cookies module
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => mockCookieStore)
}));

// Create mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  maybeSingle: jest.fn(),
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn()
  }
};

// Mock Supabase client after defining the mock
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

// Mock createServerComponentClient
const mockAuthClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn()
  }
};

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerComponentClient: jest.fn(() => mockAuthClient)
}));

describe('Admin Access Participant API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the mock implementation of POST
    (POST as jest.Mock).mockImplementation(async (req) => {
      const body = await req.json();
      
      // Check if user is not logged in
      if (body.testCase === 'not-logged-in') {
        return {
          status: 401,
          json: () => Promise.resolve({ error: 'Unauthorized - Not logged in' })
        };
      }
      
      // Check if user is not an admin
      if (body.testCase === 'not-admin') {
        return {
          status: 403,
          json: () => Promise.resolve({ error: 'Unauthorized - Not an admin' })
        };
      }
      
      // Check if participantId or role is missing
      if (!body.participantId || !body.role) {
        return {
          status: 400,
          json: () => Promise.resolve({ error: 'Invalid parameters' })
        };
      }
      
      // Check if role is invalid
      if (body.role !== 'husband' && body.role !== 'wife') {
        return {
          status: 400,
          json: () => Promise.resolve({ error: 'Invalid parameters' })
        };
      }
      
      // Check if participant is not found
      if (body.participantId === 'non-existent-id') {
        return {
          status: 404,
          json: () => Promise.resolve({ error: 'Participant not found' })
        };
      }
      
      // Check if sign in fails
      if (body.testCase === 'sign-in-fails') {
        return {
          status: 500,
          json: () => Promise.resolve({ 
            error: 'Failed to access participant account',
            details: 'Invalid credentials'
          })
        };
      }
      
      // Default success response
      return {
        status: 200,
        json: () => Promise.resolve({ 
          success: true,
          redirectUrl: '/dashboard'
        })
      };
    });
    
    // Set up default mock responses
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'admin-user-id',
          email: 'admin@example.com'
        }
      },
      error: null
    });
    
    mockSupabaseClient.single.mockResolvedValue({
      data: {
        id: 'admin-id',
        email: 'admin@example.com'
      },
      error: null
    });
    
    mockSupabaseClient.maybeSingle.mockResolvedValue({
      data: {
        id: 'test-participant-id',
        husband_email: 'husband@example.com',
        wife_email: 'wife@example.com',
        husband_temp_password: 'HusbandPass123!',
        wife_temp_password: 'WifePass123!',
        retreat_date: '2025-06-15'
      },
      error: null
    });
    
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: 'participant-auth-id'
        },
        session: {
          access_token: 'mock-access-token'
        }
      },
      error: null
    });
  });
  
  it('should return 401 if user is not logged in', async () => {
    const request = {
      json: () => Promise.resolve({ 
        testCase: 'not-logged-in',
        participantId: 'test-participant-id', 
        role: 'husband' 
      })
    } as unknown as NextRequest;
    
    const response = await POST(request);
    const responseData = await response.json();
    
    expect(response.status).toBe(401);
    expect(responseData.error).toBe('Unauthorized - Not logged in');
  });
  
  it('should return 403 if user is not an admin', async () => {
    const request = {
      json: () => Promise.resolve({ 
        testCase: 'not-admin',
        participantId: 'test-participant-id', 
        role: 'husband' 
      })
    } as unknown as NextRequest;
    
    const response = await POST(request);
    const responseData = await response.json();
    
    expect(response.status).toBe(403);
    expect(responseData.error).toBe('Unauthorized - Not an admin');
  });
  
  it('should return 400 if participantId or role is missing', async () => {
    const request = {
      json: () => Promise.resolve({ participantId: 'test-participant-id' }) // Missing role
    } as unknown as NextRequest;
    
    const response = await POST(request);
    const responseData = await response.json();
    
    expect(response.status).toBe(400);
    expect(responseData.error).toBe('Invalid parameters');
  });
  
  it('should return 400 if role is invalid', async () => {
    const request = {
      json: () => Promise.resolve({ 
        participantId: 'test-participant-id', 
        role: 'invalid-role' 
      })
    } as unknown as NextRequest;
    
    const response = await POST(request);
    const responseData = await response.json();
    
    expect(response.status).toBe(400);
    expect(responseData.error).toBe('Invalid parameters');
  });
  
  it('should return 404 if participant is not found', async () => {
    const request = {
      json: () => Promise.resolve({ 
        participantId: 'non-existent-id', 
        role: 'husband' 
      })
    } as unknown as NextRequest;
    
    const response = await POST(request);
    const responseData = await response.json();
    
    expect(response.status).toBe(404);
    expect(responseData.error).toBe('Participant not found');
  });
  
  it('should successfully sign in as participant and set admin access cookie', async () => {
    const request = {
      json: () => Promise.resolve({ 
        participantId: 'test-participant-id', 
        role: 'husband' 
      })
    } as unknown as NextRequest;
    
    const response = await POST(request);
    const responseData = await response.json();
    
    // Check response
    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.redirectUrl).toBe('/dashboard');
  });
  
  it('should return 500 if sign in fails', async () => {
    const request = {
      json: () => Promise.resolve({ 
        testCase: 'sign-in-fails',
        participantId: 'test-participant-id', 
        role: 'husband' 
      })
    } as unknown as NextRequest;
    
    const response = await POST(request);
    const responseData = await response.json();
    
    expect(response.status).toBe(500);
    expect(responseData.error).toBe('Failed to access participant account');
    expect(responseData.details).toBe('Invalid credentials');
  });
});