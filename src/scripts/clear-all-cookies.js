// This script clears all cookies
// Run it in the browser console

function clearAllCookies() {
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
  
  console.log('All cookies cleared');
  
  // Reload the page to apply the changes
  window.location.reload();
}

// Execute the function
clearAllCookies();