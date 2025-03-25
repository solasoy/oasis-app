// This script clears the auth bypass cookies
// Run it in the browser console to clear the cookies

function clearAuthBypassCookies() {
  // Clear the auth_bypass cookie
  document.cookie = 'auth_bypass=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Clear the auth_email cookie
  document.cookie = 'auth_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  console.log('Auth bypass cookies cleared');
  
  // Reload the page to apply the changes
  window.location.reload();
}

// Execute the function
clearAuthBypassCookies();