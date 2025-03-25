// This script signs out of Supabase Auth and clears all cookies
// Run it in the browser console

async function signOutAndClearCookies() {
  console.log('Signing out of Supabase Auth...');
  
  try {
    // Create a Supabase client
    const { createClient } = supabase;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL or key not found');
      console.log('Falling back to just clearing cookies');
      clearAllCookies();
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Sign out
    await supabase.auth.signOut();
    console.log('Successfully signed out of Supabase Auth');
    
    // Clear all cookies
    clearAllCookies();
  } catch (error) {
    console.error('Error signing out:', error);
    console.log('Falling back to just clearing cookies');
    clearAllCookies();
  }
}

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
  window.location.href = '/';
}

// Execute the function
signOutAndClearCookies();