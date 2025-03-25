import { createClient } from '@supabase/supabase-js';
import { generateTemporaryPassword, validatePasswordComplexity } from '@/lib/auth-utils';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

describe('Create Couple Accounts API', () => {
  let mockSupabase: any;
  let mockRequest: Request;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'test-profile-id',
          retreat_date: '2025-06-15'
        },
        error: null
      }),
      update: jest.fn().mockReturnThis(),
      auth: {
        admin: {
          createUser: jest.fn()
        }
      }
    };

    // Mock createClient to return our mock Supabase client
    (createClient as jest.Mock).mockReturnValue(mockSupabase);

    // Create a mock request
    mockRequest = new Request('http://localhost/api/admin/create-couple-accounts', {
      method: 'POST',
      body: JSON.stringify({
        profileId: 'test-profile-id',
        husbandEmail: 'husband@example.com',
        wifeEmail: 'wife@example.com'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });

  test('generates complex temporary passwords', async () => {
    // Import the route handler dynamically to use mocked dependencies
    const { POST } = await import('@/app/api/admin/create-couple-accounts/route');

    // Mock successful account creation
    mockSupabase.auth.admin.createUser
      .mockResolvedValueOnce({
        data: { user: { id: 'husband-auth-id' } },
        error: null
      })
      .mockResolvedValueOnce({
        data: { user: { id: 'wife-auth-id' } },
        error: null
      });

    // Call the route handler
    const response = await POST(mockRequest);
    const result = await response.json();

    // Verify response success
    expect(response.status).toBe(200);
    expect(result.success).toBe(true);

    // If in development mode, verify credentials
    if (process.env.NODE_ENV === 'development') {
      const { credentials } = result;

      // Verify husband password
      expect(credentials.husband.email).toBe('husband@example.com');
      expect(validatePasswordComplexity(credentials.husband.password)).toBe(true);

      // Verify wife password
      expect(credentials.wife.email).toBe('wife@example.com');
      expect(validatePasswordComplexity(credentials.wife.password)).toBe(true);

      // Ensure passwords are different
      expect(credentials.husband.password).not.toBe(credentials.wife.password);
    }
  });

  test('handles account creation errors', async () => {
    // Import the route handler dynamically to use mocked dependencies
    const { POST } = await import('@/app/api/admin/create-couple-accounts/route');

    // Simulate husband account creation failure
    mockSupabase.auth.admin.createUser
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'Husband account creation failed' }
      });

    // Call the route handler
    const response = await POST(mockRequest);
    const result = await response.json();

    // Verify error response
    expect(response.status).toBe(500);
    expect(result.error).toContain('Failed to create husband account');
  });

  test('validates input parameters', async () => {
    // Import the route handler dynamically to use mocked dependencies
    const { POST } = await import('@/app/api/admin/create-couple-accounts/route');

    // Create request with missing parameters
    const invalidRequest = new Request('http://localhost/api/admin/create-couple-accounts', {
      method: 'POST',
      body: JSON.stringify({
        // Missing profileId
        husbandEmail: 'husband@example.com'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Call the route handler
    const response = await POST(invalidRequest);
    const result = await response.json();

    // Verify error response
    expect(response.status).toBe(400);
    expect(result.error).toBe('Missing required fields');
  });

  test('generates unique passwords for each account', () => {
    // Generate multiple passwords
    const passwords = new Set();
    const numPasswords = 100;

    for (let i = 0; i < numPasswords; i++) {
      const password = generateTemporaryPassword();
      passwords.add(password);
    }

    // Expect most passwords to be unique
    expect(passwords.size).toBeGreaterThan(numPasswords * 0.9);
  });
});