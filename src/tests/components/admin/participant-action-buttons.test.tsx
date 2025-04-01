import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ParticipantActionButtons } from '@/components/admin/participant-action-buttons';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

describe('ParticipantActionButtons', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn()
  };

  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue({ error: null })
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabase);
    (fetch as jest.Mock).mockClear();
    mockRouter.push.mockClear();
    mockRouter.refresh.mockClear();
  });

  const baseParticipant = {
    id: 'test-id',
    profile_created: true,
    husband_email: 'husband@test.com',
    wife_email: 'wife@test.com',
    husband_temp_password: 'temp-password-1',
    wife_temp_password: 'temp-password-2',
    husband_auth_id: undefined,
    wife_auth_id: undefined,
    welcome_email_sent: false
  };

  test('renders all buttons', () => {
    render(<ParticipantActionButtons participant={baseParticipant} />);

    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Set Login Access')).toBeInTheDocument();
    expect(screen.getByText('Send Welcome Email')).toBeInTheDocument();
  });

  test('view button navigates to participant details', () => {
    render(<ParticipantActionButtons participant={baseParticipant} />);

    fireEvent.click(screen.getByText('View'));
    expect(mockRouter.push).toHaveBeenCalledWith('/admin/participants/test-id');
  });

  test('edit button navigates to create profile page', () => {
    render(<ParticipantActionButtons participant={baseParticipant} />);

    fireEvent.click(screen.getByText('Edit'));
    expect(mockRouter.push).toHaveBeenCalledWith('/admin/create-profile?application=test-id&edit=true');
  });

  test('set login access button is enabled when conditions are met', () => {
    render(<ParticipantActionButtons participant={baseParticipant} />);

    const setLoginAccessButton = screen.getByText('Set Login Access');
    expect(setLoginAccessButton).not.toBeDisabled();
  });

  test('set login access button calls correct endpoint', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    render(<ParticipantActionButtons participant={baseParticipant} />);

    fireEvent.click(screen.getByText('Set Login Access'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/participants/set-login-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId: 'test-id' })
      });
    });
  });

  test('send welcome email button calls correct endpoint', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    render(<ParticipantActionButtons participant={baseParticipant} />);

    fireEvent.click(screen.getByText('Send Welcome Email'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/send-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          participantId: 'test-id',
          role: 'both'
        })
      });
    });
  });

  test('delete button calls supabase delete method', async () => {
    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    render(<ParticipantActionButtons participant={baseParticipant} />);

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('participants');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'test-id');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  test('buttons are disabled in appropriate scenarios', () => {
    const disabledParticipant = {
      ...baseParticipant,
      husband_auth_id: 'existing-id',
      welcome_email_sent: true
    };

    render(<ParticipantActionButtons participant={disabledParticipant} />);

    const setLoginAccessButton = screen.getByText('Set Login Access');
    const sendWelcomeEmailButton = screen.getByText('Email Sent');

    expect(setLoginAccessButton).toBeDisabled();
    expect(sendWelcomeEmailButton).toBeDisabled();
  });
});