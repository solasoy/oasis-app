import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware_admin_login';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Mock NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      next: jest.fn(() => ({ type: 'next' })),
      redirect: jest.fn((url) => ({ type: 'redirect', url })),
    },
  };
});

// Create mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    getUser: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createMiddlewareClient: jest.fn(() => mockSupabaseClient),
}));

describe('Admin Login Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock responses
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
    });
    
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
    });
    
    mockSupabaseClient.single.mockResolvedValue({
      data: null,
      error: null,
    });
  });

  const createMockRequest = (url: string, cookies: Record<string, string> = {}): NextRequest => {
    const cookieEntries = Object.entries(cookies).map(([name, value]) => ({
      name,
      value,
      get: () => value,
    }));
    
    return {
      url,
      nextUrl: new URL(url),
      cookies: {
        get: (name: string) => cookieEntries.find(c => c.name === name) || null,
      },
    } as unknown as NextRequest;
  };

  it('should allow access to admin login page without authentication', async () => {
    const req = createMockRequest('http://localhost:3000/admin/login');
    await middleware(req);
    
    // Should proceed without authentication checks
    expect(NextResponse.next).toHaveBeenCalled();
    expect(createMiddlewareClient).not.toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it('should redirect unauthenticated users to login page', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
    });
    
    const req = createMockRequest('http://localhost:3000/admin/dashboard');
    await middleware(req);
    
    expect(NextResponse.redirect).toHaveBeenCalled();
    expect(createMiddlewareClient).toHaveBeenCalled();
    
    const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectCall.pathname).toBe('/admin/login');
  });

  it('should check auth bypass cookies', async () => {
    const req = createMockRequest('http://localhost:3000/admin/dashboard', {
      'auth_bypass': 'true',
      'auth_email': 'admin@example.com',
    });
    
    mockSupabaseClient.single.mockResolvedValue({
      data: { id: 1, email: 'admin@example.com' },
      error: null,
    });
    
    await middleware(req);
    
    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it('should redirect non-admin users to participant dashboard', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: { email: 'user@example.com' } } },
    });
    
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { email: 'user@example.com' } },
    });
    
    mockSupabaseClient.single.mockResolvedValue({
      data: null,
      error: null,
    });
    
    // Mock the from().select() chain for the "get all admins" fallback
    mockSupabaseClient.from.mockImplementationOnce(() => ({
      select: () => ({
        data: [],
        error: null,
      }),
    }));
    
    const req = createMockRequest('http://localhost:3000/admin/dashboard');
    await middleware(req);
    
    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectCall = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
    expect(redirectCall.pathname).toBe('/participant');
  });

  it('should allow access for authenticated admin users', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: { email: 'admin@example.com' } } },
    });
    
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { email: 'admin@example.com' } },
    });
    
    mockSupabaseClient.single.mockResolvedValue({
      data: { id: 1, email: 'admin@example.com' },
      error: null,
    });
    
    const req = createMockRequest('http://localhost:3000/admin/dashboard');
    await middleware(req);
    
    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it('should handle case sensitivity in email addresses', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: { email: 'Admin@Example.com' } } },
    });
    
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { email: 'Admin@Example.com' } },
    });
    
    // First attempt with exact match fails
    mockSupabaseClient.single.mockRejectedValue(new Error('Not found'));
    
    // Second attempt with "get all admins" succeeds
    mockSupabaseClient.from.mockImplementationOnce(() => ({
      select: () => ({
        data: [
          { id: 1, email: 'admin@example.com', name: 'Admin' }
        ],
        error: null,
      }),
    }));
    
    const req = createMockRequest('http://localhost:3000/admin/dashboard');
    await middleware(req);
    
    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it('should handle whitespace in email addresses', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: { email: ' admin@example.com ' } } },
    });
    
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { email: ' admin@example.com ' } },
    });
    
    mockSupabaseClient.single.mockResolvedValue({
      data: { id: 1, email: 'admin@example.com' },
      error: null,
    });
    
    const req = createMockRequest('http://localhost:3000/admin/dashboard');
    await middleware(req);
    
    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });
});