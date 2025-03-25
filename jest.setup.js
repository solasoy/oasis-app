// Load environment variables for testing
require('dotenv').config({ path: '.env.test' });

// Log environment variables for debugging
console.log('Environment Variables in jest.setup.js:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing');
console.log('TEST_ADMIN_EMAIL:', process.env.TEST_ADMIN_EMAIL);
console.log('TEST_ADMIN_PASSWORD:', process.env.TEST_ADMIN_PASSWORD ? 'Present' : 'Missing');