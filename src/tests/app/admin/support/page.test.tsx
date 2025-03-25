import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminSupportPage from '@/app/admin/support/page';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Mock the Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(),
}));

// Mock the Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/admin/support'),
}));

describe('AdminSupportPage', () => {
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    auth: {
      getUser: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase);
    
    // Default mock responses
    mockSupabase.select.mockReturnThis();
    mockSupabase.from.mockReturnThis();
    mockSupabase.order.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    
    // Mock the initial fetch of admins
    mockSupabase.select.mockImplementationOnce(() => ({
      order: () => ({
        data: [
          { id: 1, email: 'admin1@example.com', name: 'Admin One', created_at: '2023-01-01T00:00:00Z' },
          { id: 2, email: 'admin2@example.com', name: 'Admin Two', created_at: '2023-01-02T00:00:00Z' },
        ],
        error: null,
      }),
    }));
    
    // Mock the auth.getUser response
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { email: 'admin1@example.com' } },
    });
  });

  it('renders the admin support page', async () => {
    render(<AdminSupportPage />);
    
    expect(screen.getByText('Admin Support')).toBeInTheDocument();
    expect(screen.getByText('Add New Admin')).toBeInTheDocument();
    expect(screen.getByText('Admin Accounts')).toBeInTheDocument();
    
    // Wait for the admin list to load
    await waitFor(() => {
      expect(screen.getByText('admin1@example.com')).toBeInTheDocument();
      expect(screen.getByText('admin2@example.com')).toBeInTheDocument();
    });
  });

  it('allows adding a new admin', async () => {
    // Mock the check for existing admin
    mockSupabase.single.mockResolvedValueOnce({ data: null });
    
    // Mock the insert response
    mockSupabase.insert.mockImplementationOnce(() => ({
      select: () => ({
        single: () => ({
          data: { id: 3, email: 'newadmin@example.com', name: 'New Admin', created_at: '2023-01-03T00:00:00Z' },
          error: null,
        }),
      }),
    }));
    
    render(<AdminSupportPage />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'newadmin@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'New Admin' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Admin'));
    
    // Check that the API was called correctly
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('admins');
      expect(mockSupabase.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          email: 'newadmin@example.com',
          name: 'New Admin',
        }),
      ]);
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/Admin New Admin \(newadmin@example.com\) added successfully/i)).toBeInTheDocument();
    });
  });

  it('prevents adding an admin that already exists', async () => {
    // Mock the check for existing admin to return an existing admin
    mockSupabase.single.mockResolvedValueOnce({
      data: { id: 1, email: 'admin1@example.com', name: 'Admin One' },
    });
    
    render(<AdminSupportPage />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'admin1@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Admin One' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Admin'));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/An admin with this email already exists/i)).toBeInTheDocument();
    });
  });

  it('allows removing an admin', async () => {
    // Mock the delete response
    mockSupabase.delete.mockImplementationOnce(() => ({
      eq: () => ({
        data: null,
        error: null,
      }),
    }));
    
    render(<AdminSupportPage />);
    
    // Wait for the admin list to load
    await waitFor(() => {
      expect(screen.getByText('admin2@example.com')).toBeInTheDocument();
    });
    
    // Find the remove button for the second admin
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[1]); // Click the second remove button
    
    // Check that the API was called correctly
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('admins');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 2);
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/Admin admin2@example.com removed successfully/i)).toBeInTheDocument();
    });
  });

  it('prevents removing your own admin account', async () => {
    render(<AdminSupportPage />);
    
    // Wait for the admin list to load
    await waitFor(() => {
      expect(screen.getByText('admin1@example.com')).toBeInTheDocument();
    });
    
    // Find the remove button for the first admin (which is the current user)
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]); // Click the first remove button
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/You cannot remove your own admin account/i)).toBeInTheDocument();
    });
    
    // Verify that delete was not called
    expect(mockSupabase.delete).not.toHaveBeenCalled();
  });
});