import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ParticipantAccessButton } from '@/components/admin/participant-access-button';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

describe('ParticipantAccessButton', () => {
  const mockRouter = {
    push: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // Setup fetch mock
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        redirectUrl: '/dashboard'
      })
    });
  });
  
  it('renders with default label', () => {
    render(
      <ParticipantAccessButton
        participantId="test-participant-id"
        role="husband"
      />
    );
    
    expect(screen.getByRole('button')).toHaveTextContent('Access Husband Dashboard');
  });
  
  it('renders with custom label', () => {
    render(
      <ParticipantAccessButton
        participantId="test-participant-id"
        role="wife"
        label="Custom Label"
      />
    );
    
    expect(screen.getByRole('button')).toHaveTextContent('Custom Label');
  });
  
  it('applies custom className', () => {
    render(
      <ParticipantAccessButton
        participantId="test-participant-id"
        role="husband"
        className="custom-class"
      />
    );
    
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
  
  it('shows loading state when clicked', async () => {
    // Setup fetch to delay response
    (global.fetch as jest.Mock).mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              redirectUrl: '/dashboard'
            })
          });
        }, 100);
      });
    });
    
    render(
      <ParticipantAccessButton
        participantId="test-participant-id"
        role="husband"
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    // Button should show loading state
    expect(screen.getByRole('button')).toHaveTextContent('Accessing...');
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  it('calls API with correct parameters and redirects on success', async () => {
    render(
      <ParticipantAccessButton
        participantId="test-participant-id"
        role="husband"
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    // Check that fetch was called with correct parameters
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/access-participant',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            participantId: 'test-participant-id',
            role: 'husband'
          })
        })
      );
    });
    
    // Check that router.push was called with the redirectUrl
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });
  
  it('shows error alert when API call fails', async () => {
    // Mock window.alert
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Setup fetch to return error
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        error: 'Test error message'
      })
    });
    
    render(
      <ParticipantAccessButton
        participantId="test-participant-id"
        role="husband"
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    // Check that alert was called with error message
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('Failed to access participant dashboard')
      );
    });
    
    // Button should not be in loading state anymore
    expect(screen.getByRole('button')).not.toHaveTextContent('Accessing...');
    expect(screen.getByRole('button')).not.toBeDisabled();
    
    // Cleanup
    mockAlert.mockRestore();
  });
});