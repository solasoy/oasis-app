// This script sets the necessary cookies to bypass admin login
// Run this in the browser console to quickly access the admin dashboard

function setAdminBypassCookies(email = 'admin@example.com') {
  // Set the bypass cookies
  document.cookie = `auth_bypass=true; path=/; max-age=86400`; // 24 hours
  document.cookie = `auth_email=${email}; path=/; max-age=86400`; // 24 hours
  
  console.log(`Admin bypass cookies set for ${email}`);
  console.log('You can now access the admin dashboard at /admin');
  
  // Optionally redirect to the admin dashboard
  if (confirm('Redirect to admin dashboard now?')) {
    window.location.href = '/admin';
  }
}

// Usage:
// setAdminBypassCookies('your-admin-email@example.com');
setAdminBypassCookies();