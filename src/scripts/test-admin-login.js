// This script tests if the admin login page is accessible
// Run this script in the browser console

async function testAdminLogin() {
  console.log('Testing admin login page accessibility...');
  
  try {
    // Try to fetch the admin login page
    const response = await fetch('/admin/login');
    
    if (response.redirected) {
      console.error('❌ Admin login page redirected to:', response.url);
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
testAdminLogin();