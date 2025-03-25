import { middleware } from '../middleware_participant_login';
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Mock NextResponse.redirect and next
const mockRedirect = jest.fn().mockImplementation((url) => ({ url }));
const mockNext = jest.fn().mockReturnValue({
  headers: new Map(),
  cookies: {
    getAll: () => [],
    get: () => null,
    set: jest.fn(),
    delete: jest.fn(),
    has: () => false,
    clear: jest.fn(),
    getSetCookie: () => []
  }
});

NextResponse.redirect = mockRedirect;
NextResponse.next = mockNext;

// Mock createMiddlewareClient
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createMiddlewareClient: jest.fn()
}));

describe('Participant Login Middleware', () => {
  let mockRequest: Partial<NextRequest>;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request
    mockRequest = {
      nextUrl: {
        pathname: '/participant/dashboard',
        href: 'http://localhost:3000/participant/dashboard',
      } as any,
      url: 'http://localhost:3000/participant/dashboard',
      cookies: {
        get: jest.fn().mockReturnValue(null),
      } as any,
    };
  });
  
  it('should redirect to login page if not authenticated', async () => {
    // Create a mock client with no session
    const mockClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
        }),
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
        }),
        signOut: jest.fn().mockResolvedValue({}),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null }),
    };
    
    // Pass the mock client to the middleware
    await middleware(mockRequest as NextRequest, {
      createClient: () => mockClient
    });
    
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://localhost:3000/participant/login',
      })
    );
  });
  
  it('should allow access if user is an admin', async () => {
    // Mock authenticated session
    const mockClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { email: 'admin@example.com' } } },
        }),
        getUser: jest.fn().mockResolvedValue({
          data: { user: { email: 'admin@example.com' } },
        }),
        signOut: jest.fn().mockResolvedValue({}),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { email: 'admin@example.com', name: 'Admin User' },
      }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null }),
    };
    
    // Pass the mock client to the middleware
    await middleware(mockRequest as NextRequest, {
      createClient: () => mockClient
    });
    
    // Should not redirect
    expect(mockRedirect).not.toHaveBeenCalled();
  });
  
  it('should allow access if user is a participant', async () => {
    // Mock authenticated session
    const mockClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { email: 'participant@example.com' } } },
        }),
        getUser: jest.fn().mockResolvedValue({
          data: { user: { email: 'participant@example.com' } },
        }),
        signOut: jest.fn().mockResolvedValue({}),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null, // Not an admin
      }),
      maybeSingle: jest.fn().mockImplementation((field) => {
        // This is called twice, once for husband_email and once for wife_email
        // We'll return data for the husband_email check
        return Promise.resolve({
          data: {
            husband_email: 'participant@example.com',
            access_expires_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          },
        });
      }),
    };
    
    // Pass the mock client to the middleware
    await middleware(mockRequest as NextRequest, {
      createClient: () => mockClient
    });
    
    // Should not redirect
    expect(mockRedirect).not.toHaveBeenCalled();
  });
  
  it('should redirect to expired page if participant access has expired', async () => {
    // Mock authenticated session
    const mockClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user: { email: 'expired@example.com' } } },
        }),
        getUser: jest.fn().mockResolvedValue({
          data: { user: { email: 'expired@example.com' } },
        }),
        signOut: jest.fn().mockResolvedValue({}),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null, // Not an admin
      }),
      maybeSingle: jest.fn().mockImplementation((field) => {
        // Return data with expired access
        return Promise.resolve({
          data: {
            husband_email: 'expired@example.com',
            access_expires_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          },
        });
      }),
    };
    
    // Pass the mock client to the middleware
    await middleware(mockRequest as NextRequest, {
      createClient: () => mockClient
    });
    
    // Should redirect to expired page
    expect(mockRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://localhost:3000/access-expired',
      })
    );
    
    // Should sign out the user
    expect(mockClient.auth.signOut).toHaveBeenCalled();
  });
  
  it('should skip protection for login page', async () => {
    // Set pathname to login page
    mockRequest.nextUrl!.pathname = '/participant/login';
    
    // Create a mock client
    const mockClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
        }),
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
        }),
        signOut: jest.fn().mockResolvedValue({}),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null }),
    };
    
    // Pass the mock client to the middleware
    await middleware(mockRequest as NextRequest, {
      createClient: () => mockClient
    });
    
    // Should not redirect
    expect(mockRedirect).not.toHaveBeenCalled();
  });
  
  it('should allow access with auth bypass', async () => {
    // Mock auth bypass cookies
    (mockRequest.cookies!.get as jest.Mock).mockImplementation((name) => {
      if (name === 'auth_bypass') return { value: 'true' };
      if (name === 'auth_email') return { value: 'bypass@example.com' };
      return null;
    });
    
    // Mock client with participant data
    const mockClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null }, // No session, using bypass
        }),
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
        }),
        signOut: jest.fn().mockResolvedValue({}),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null, // Not an admin
      }),
      maybeSingle: jest.fn().mockImplementation((field) => {
        // Return participant data for bypass email
        return Promise.resolve({
          data: {
            husband_email: 'bypass@example.com',
            access_expires_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          },
        });
      }),
    };
    
    // Pass the mock client to the middleware
    await middleware(mockRequest as NextRequest, {
      createClient: () => mockClient
    });
    
    // Should not redirect
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});