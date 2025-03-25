import { createClient } from '@supabase/supabase-js';
import { createServerComponentClient as realCreateServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Mock data
const mockAdminUser = {
  id: 'dev-admin-id',
  email: 'dev-admin@example.com',
  role: 'admin'
};

const mockApplications = [
  {
    id: 'app-1',
    his_name: { first: 'John', last: 'Doe' },
    her_name: { first: 'Jane', last: 'Doe' },
    retreat_date: 'June 10-15, 2025',
    submitted_at: new Date().toISOString(),
    status: 'pending',
    profile_created: false
  },
  {
    id: 'app-2',
    his_name: { first: 'Michael', last: 'Smith' },
    her_name: { first: 'Sarah', last: 'Smith' },
    retreat_date: 'July 15-20, 2025',
    submitted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    profile_created: true
  }
];

const mockRetreatDates = [
  {
    id: 'retreat-1',
    name: 'Summer Retreat 2025',
    start_date: '2025-06-10',
    end_date: '2025-06-15',
    is_active: true,
    capacity: 20,
    registered: 12
  },
  {
    id: 'retreat-2',
    name: 'Fall Retreat 2025',
    start_date: '2025-09-05',
    end_date: '2025-09-10',
    is_active: true,
    capacity: 20,
    registered: 5
  }
];

const mockParticipants = [
  {
    id: 'participant-1',
    husband_first_name: 'John',
    husband_last_name: 'Doe',
    wife_first_name: 'Jane',
    wife_last_name: 'Doe',
    husband_email: 'john.doe@example.com',
    wife_email: 'jane.doe@example.com',
    status: 'active',
    access_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'participant-2',
    husband_first_name: 'Michael',
    husband_last_name: 'Smith',
    wife_first_name: 'Sarah',
    wife_last_name: 'Smith',
    husband_email: 'michael.smith@example.com',
    wife_email: 'sarah.smith@example.com',
    status: 'active',
    access_expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockAdmins = [
  {
    id: 'dev-admin-id',
    email: 'dev-admin@example.com',
    name: 'Dev Admin'
  }
];

const mockDocuments = [
  {
    id: 'doc-1',
    name: 'Retreat Welcome Packet',
    type: 'welcome',
    last_updated: new Date().toISOString()
  },
  {
    id: 'doc-2',
    name: 'Participant Handbook',
    type: 'guide',
    last_updated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockEmailTemplates = [
  {
    id: 'email-1',
    name: 'Welcome Email',
    subject: 'Welcome to Oasis Retreat',
    last_updated: new Date().toISOString()
  },
  {
    id: 'email-2',
    name: 'Reminder Email',
    subject: 'Upcoming Retreat Reminder',
    last_updated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock Supabase client
export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: async () => ({
        data: { 
          user: mockAdminUser 
        },
        error: null
      }),
      getSession: async () => ({
        data: { 
          session: { 
            user: mockAdminUser 
          } 
        },
        error: null
      }),
      signOut: async () => ({ error: null })
    },
    from: (table: string) => {
      const mockData = {
        'applications': mockApplications,
        'retreat_dates': mockRetreatDates,
        'participants': mockParticipants,
        'admins': mockAdmins,
        'documents': mockDocuments,
        'email_templates': mockEmailTemplates
      };

      return {
        select: (columns?: string) => ({
          eq: (column: string, value: string) => ({
            data: mockData[table as keyof typeof mockData].filter(
              (item: any) => item[column] === value
            ),
            error: null
          }),
          order: () => ({
            data: mockData[table as keyof typeof mockData],
            error: null
          })
        })
      };
    }
  };
}

// Export a function to create the mock client only in development mode
export function createClientComponentClient() {
  if (process.env.NODE_ENV === 'development') {
    return createMockSupabaseClient();
  }
  // In production, use the real Supabase client
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function createServerComponentClient(options: { cookies?: () => any } = {}) {
  if (process.env.NODE_ENV === 'development') {
    return createMockSupabaseClient();
  }
  // In production, use the real Supabase server component client
  return realCreateServerComponentClient({ 
    cookies: options.cookies || (() => cookies())
  });
}