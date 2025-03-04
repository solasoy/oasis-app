import { POST } from '@/app/api/applications/route';

// Mock Next.js
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      status: 200,
      json: async () => data
    }))
  }
}));

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => ({
          data: { 
            id: 'test-id',
            status: 'pending',
            retreat_date: "March 5-9, 2025",
            his_name: { first: "John", last: "Doe" },
            her_name: { first: "Jane", last: "Doe" }
          },
          error: null
        }))
      }))
    }))
  }))
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));

// Mock Resend
const mockResend = {
  emails: {
    send: jest.fn().mockResolvedValue({ id: 'email_id' })
  }
};

jest.mock('resend', () => ({
  Resend: jest.fn(() => mockResend)
}));

describe('Applications API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  const createMockRequest = (body: any) => ({
    json: jest.fn().mockResolvedValue(body),
    headers: new Headers({
      'content-type': 'application/json'
    })
  });

  it('should handle successful application submission', async () => {
    // Arrange
    const testData = {
      retreatDate: "March 5-9, 2025",
      hisName: { first: "John", last: "Doe" },
      hisAge: "30s",
      hisPhone: "123-456-7890",
      hisEmail: "john@example.com",
      herName: { first: "Jane", last: "Doe" },
      herAge: "30s",
      herPhone: "123-456-7891",
      herEmail: "jane@example.com",
      address: {
        line1: "123 Main St",
        line2: "",
        city: "Dallas",
        state: "TX",
        postal: "75201",
        country: "US"
      },
      isOCCMember: "yes",
      isChristFollower: "yes",
      weddingDate: "2020-01-01",
      livingArrangement: "together",
      children: "none",
      previousMarriage: "no",
      retreatReason: "To strengthen our marriage",
      previousTherapy: "no"
    };

    const mockReq = createMockRequest(testData);

    try {
      // Act
      const response = await POST(mockReq as any);
      const data = await response.json();

      // Assert
      expect(data).toBeDefined();
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        status: 'pending',
        retreat_date: testData.retreatDate,
        his_name: testData.hisName,
        her_name: testData.herName
      });

      // Verify Supabase was called
      expect(mockSupabase.from).toHaveBeenCalledWith('applications');
      
      // Verify emails were sent
      expect(mockResend.emails.send).toHaveBeenCalledTimes(2);
    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });

  it('should handle missing data', async () => {
    const mockReq = createMockRequest({});
    const response = await POST(mockReq as any);
    const data = await response.json();
    
    expect(data.error).toBeDefined();
    expect(mockSupabase.from).not.toHaveBeenCalled();
    expect(mockResend.emails.send).not.toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    // Mock Supabase to return an error
    mockSupabase.from.mockImplementationOnce(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: { message: 'Database error' }
          }))
        }))
      }))
    }));

    const mockReq = createMockRequest({
      retreatDate: "March 5-9, 2025",
      hisName: { first: "John", last: "Doe" }
    });

    const response = await POST(mockReq as any);
    const data = await response.json();
    
    expect(data.error).toBeDefined();
    expect(mockResend.emails.send).not.toHaveBeenCalled();
  });
}); 