// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.ADMIN_EMAIL = 'admin@test.com';

// Suppress console.error and console.warn in tests
global.console.error = jest.fn();
global.console.warn = jest.fn(); 