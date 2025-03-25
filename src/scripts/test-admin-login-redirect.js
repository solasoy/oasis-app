// This script tests if the admin login page is accessible
// Run this script in the browser console

async function testAdminLoginRedirect() {
  console.log('Testing admin login page accessibility...');
  
  try {
    // Try to fetch the admin login page
    const response = await fetch('/admin/login', {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
      },
      redirect: 'manual', // Don't follow redirects automatically
    });
    
    console.log('Response status:', response.status);
    console.log('Response type:', response.type);
    
    if (response.type === 'opaqueredirect') {
      console.error('❌ Admin login page redirected');
      console.log('This suggests a middleware issue is causing the redirect');
      return;
    }
    
    if (response.ok) {
      console.log('✅ Admin login page is accessible');
      return;
    }
    
    console.error('❌ Admin login page returned status:', response.status);
  } catch (error) {
    console.error('❌ Error testing admin login page:', error);
  }
}

// Execute the test
testAdminLoginRedirect();

// Also check which middleware is handling the request
// This will be visible in the server logs
console.log('Navigating to admin login page...');
window.location.href = '/admin/login';