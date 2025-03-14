import { render } from '@testing-library/react';
import AdminLayout from '@/app/(protected)/admin/layout';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';

// Mock the necessary dependencies
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerComponentClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('AdminLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to /admin/login if user is not authenticated', async () => {
    // Mock Supabase auth.getUser to return no user
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    };
    (createServerComponentClient as jest.Mock).mockReturnValue(mockSupabase);

    // Render the component
    await AdminLayout({ children: <div>Test</div> });

    // Check if redirect was called with the correct path
    expect(redirect).toHaveBeenCalledWith('/admin/login');
  });

  it('should redirect to /dashboard if user is authenticated but not in admins table', async () => {
    // Mock Supabase auth.getUser to return a user
    const mockUser = { id: 'user-123', email: 'user@example.com' };
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'No admin found' },
        }),
      }),
    };
    (createServerComponentClient as jest.Mock).mockReturnValue(mockSupabase);

    // Render the component
    await AdminLayout({ children: <div>Test</div> });

    // Check if redirect was called with the correct path
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('should render children if user is authenticated and in admins table', async () => {
    // Mock Supabase auth.getUser to return a user
    const mockUser = { id: 'admin-123', email: 'admin@example.com' };
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'admin-123' },
          error: null,
        }),
      }),
    };
    (createServerComponentClient as jest.Mock).mockReturnValue(mockSupabase);

    // Use a spy to check if the component renders without redirecting
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    try {
      // Render the component
      const result = await AdminLayout({ children: <div>Test</div> });
      
      // If we get here, no redirect occurred
      expect(redirect).not.toHaveBeenCalled();
      
      // Check that the children are rendered
      expect(result.props.children).toEqual(<div>Test</div>);
    } catch (error) {
      // This should not happen
      fail('Component should not throw an error');
    } finally {
      consoleSpy.mockRestore();
    }
  });
});