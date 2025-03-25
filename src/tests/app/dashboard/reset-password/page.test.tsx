import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPasswordPage from '@/app/dashboard/reset-password/page';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    hash: '#access_token=test-token&refresh_token=test-refresh&type=recovery',
    assign: jest.fn()
  },
  writable: true
});

describe('ResetPasswordPage', () => {
  const mockRouter = {
    push: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // Setup fetch mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true
      })
    });
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('renders the reset password form', () => {
    render(<ResetPasswordPage />);
    
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument();
  });
  
  it('shows error when passwords do not match', async () => {
    render(<ResetPasswordPage />);
    
    // Enter different passwords
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), {
      target: { value: 'password456' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    
    // Check error message
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
    
    // Fetch should not be called
    expect(global.fetch).not.toHaveBeenCalled();
  });
  
  it('shows error when password is too short', async () => {
    render(<ResetPasswordPage />);
    
    // Enter short password
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'short' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), {
      target: { value: 'short' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    
    // Check error message
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });
    
    // Fetch should not be called
    expect(global.fetch).not.toHaveBeenCalled();
  });
  
  it('shows error when hash fragment is missing', async () => {
    // Remove hash fragment
    Object.defineProperty(window, 'location', {
      value: {
        hash: '',
        assign: jest.fn()
      },
      writable: true
    });
    
    render(<ResetPasswordPage />);
    
    // Check error message
    await waitFor(() => {
      expect(screen.getByText('Invalid or missing reset token. Please request a new password reset link.')).toBeInTheDocument();
    });
  });
  
  it('updates password and shows success message', async () => {
    // Mock window.location with valid hash
    Object.defineProperty(window, 'location', {
      value: {
        hash: '#access_token=test-token&refresh_token=test-refresh&type=recovery',
        assign: jest.fn()
      },
      writable: true
    });

    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true
      })
    });
    
    render(<ResetPasswordPage />);
    
    // Enter matching passwords
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'newpassword123' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), {
      target: { value: 'newpassword123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    
    // Check that fetch was called with correct parameters
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/reset-password',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            password: 'newpassword123',
            hash: 'access_token=test-token&refresh_token=test-refresh&type=recovery'
          })
        })
      );
    });
    
    // Check success message
    await waitFor(() => {
      expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument();
    });
  });
  
  it('shows error when API call fails', async () => {
    // Mock window.location with valid hash
    Object.defineProperty(window, 'location', {
      value: {
        hash: '#access_token=test-token&refresh_token=test-refresh&type=recovery',
        assign: jest.fn()
      },
      writable: true
    });
    
    // Mock fetch error
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        error: 'Failed to reset password'
      })
    });
    
    render(<ResetPasswordPage />);
    
    // Enter matching passwords
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'newpassword123' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Confirm New Password'), {
      target: { value: 'newpassword123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    
    // Check error message
    await waitFor(() => {
      expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to reset password/i)).toBeInTheDocument();
    });
  });
});