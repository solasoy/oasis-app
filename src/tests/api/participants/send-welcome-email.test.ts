import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Resend } from 'resend';
import { getParticipantWelcomeEmailTemplate } from '@/lib/email-templates';

// Mock dependencies
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerComponentClient: jest.fn()
}));

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn()
    }
  }))
}));

jest.mock('@/lib/email-templates', () => ({
  getParticipantWelcomeEmailTemplate: jest.fn()
}));

describe('Send Welcome Email API', () => {
  let mockSupabase: any;
  let mockResend: any;
  let mockRequest: Request;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original environment variables
    originalEnv = { ...process.env };

    // Reset mocks
    jest.clearAllMocks();

    // Setup mock environment variables
    jest.replaceProperty(process, 'env', {
      ...originalEnv,
      NODE_ENV: 'development',
      ADMIN_EMAIL: 'admin@example.com',
      RESEND_TEST_MODE: 'true',
      NEXT_PUBLIC_APP_URL: 'https://test.example.com'
    });

    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'test-participant-id',
          husband_first_name: 'John',
          husband_last_name: 'Doe',
          husband_email: 'john.doe@example.com',
          husband_temp_password: 'TestHusbandPass123!',
          wife_first_name: 'Jane',
          wife_last_name: 'Doe',
          wife_email: 'jane.doe@example.com',
          wife_temp_password: 'TestWifePass456@',
          retreat_date: '2025-06-15',
          applications: [{ retreat_date: '2025-06-15' }]
        },
        error: null
      }),
      update: jest.fn().mockReturnThis()
    };

    (createServerComponentClient as jest.Mock).mockReturnValue(mockSupabase);

    // Setup mock Resend
    mockResend = {
      emails: {
        send: jest.fn().mockResolvedValue({ data: { id: 'email-sent-id' } })
      }
    };

    (Resend as jest.Mock).mockReturnValue(mockResend);

    // Mock email template
    (getParticipantWelcomeEmailTemplate as jest.Mock).mockReturnValue('<html>Welcome Email</html>');

    // Create a mock request
    mockRequest = new Request('http://localhost/api/admin/send-welcome-email', {
      method: 'POST',
      body: JSON.stringify({
        participantId: 'test-participant-id',
        forceResend: false
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });

  afterEach(() => {
    // Restore original environment variables
    jest.replaceProperty(process, 'env', originalEnv);
  });

  test('sends welcome emails successfully', async () => {
    // Import the route handler dynamically to use mocked dependencies
    const { POST } = await import('@/app/api/admin/send-welcome-email/route');

    // Call the route handler
    const response = await POST(mockRequest);
    const result = await response.json();

    // Verify Supabase queries
    expect(mockSupabase.from).toHaveBeenCalledWith('participants');
    expect(mockSupabase.select).toHaveBeenCalled();
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'test-participant-id');

    // Verify email template generation
    expect(getParticipantWelcomeEmailTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        husband_first_name: 'John',
        wife_first_name: 'Jane',
        husband_temp_password: 'TestHusbandPass123!',
        wife_temp_password: 'TestWifePass456@'
      })
    );

    // Verify email sending
    expect(mockResend.emails.send).toHaveBeenCalledTimes(2);
    
    // Verify response
    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.emailStatus).toBe('success');
  });

  test('handles missing participant data', async () => {
    // Mock Supabase to return no participant data
    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'No participant found' }
    });

    // Import the route handler dynamically to use mocked dependencies
    const { POST } = await import('@/app/api/admin/send-welcome-email/route');

    // Call the route handler
    const response = await POST(mockRequest);
    const result = await response.json();

    // Verify error response
    expect(response.status).toBe(500);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to fetch participant data');
  });

  test('handles email sending errors', async () => {
    // Mock Resend to throw an error when sending emails
    mockResend.emails.send.mockRejectedValueOnce(new Error('Email sending failed'));

    // Import the route handler dynamically to use mocked dependencies
    const { POST } = await import('@/app/api/admin/send-welcome-email/route');

    // Call the route handler
    const response = await POST(mockRequest);
    const result = await response.json();

    // Verify error response
    expect(response.status).toBe(500);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to send welcome email');
  });

  test('validates input parameters', async () => {
    // Create request with missing participantId
    const invalidRequest = new Request('http://localhost/api/admin/send-welcome-email', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Import the route handler dynamically to use mocked dependencies
    const { POST } = await import('@/app/api/admin/send-welcome-email/route');

    // Call the route handler
    const response = await POST(invalidRequest);
    const result = await response.json();

    // Verify error response
    expect(response.status).toBe(500);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Missing participant ID');
  });
});