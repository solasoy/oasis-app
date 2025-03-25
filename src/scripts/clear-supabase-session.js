// This script clears the Supabase Auth session and all cookies
// Run it in the browser console

async function clearSupabaseSession() {
  console.log('Clearing Supabase Auth session and cookies...');
  
  try {
    // Try to sign out of Supabase Auth
    if (window.supabase) {
      await window.supabase.auth.signOut();
      console.log('Successfully signed out of Supabase Auth');
    } else {
      console.log('Supabase client not found in window object');
    }
  } catch (error) {
    console.error('Error signing out of Supabase Auth:', error);
  }
  
  // Clear all cookies
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
  
  console.log('All cookies cleared');
  
  // Clear localStorage
  localStorage.clear();
  console.log('localStorage cleared');
  
  // Clear sessionStorage
  sessionStorage.clear();
  console.log('sessionStorage cleared');
  
  console.log('Session cleanup complete. Reloading page in 2 seconds...');
  
  // Reload the page after a short delay
  setTimeout(() => {
    window.location.href = '/';
  }, 2000);
}

// Execute the function
clearSupabaseSession();