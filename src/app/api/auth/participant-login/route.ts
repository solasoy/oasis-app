import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  try {
    console.log('Participant login attempt started');
    const cookieStore = cookies();
    
    // Create a Supabase client with the service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    console.log('Supabase client created');
    
    // Parse request body
    const { email, password } = await request.json();
    console.log(`Login attempt for email: ${email}`);
    
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Check if the email belongs to a participant (case insensitive)
    console.log('Checking if email belongs to a participant');
    console.log(`Email to check: "${email}"`);
    
    // Log all participants for debugging
    const { data: allParticipants } = await supabase
      .from('participants')
      .select('id, husband_email, wife_email')
      .limit(10);
      
    console.log('All participants:', allParticipants);
    
    // Try case-insensitive search using ilike
    const { data: husbandDataIlike } = await supabase
      .from('participants')
      .select('*')
      .ilike('husband_email', email)
      .maybeSingle();
      
    const { data: wifeDataIlike } = await supabase
      .from('participants')
      .select('*')
      .ilike('wife_email', email)
      .maybeSingle();
    
    // Try exact match
    const { data: husbandData } = await supabase
      .from('participants')
      .select('*')
      .eq('husband_email', email)
      .maybeSingle();
      
    const { data: wifeData } = await supabase
      .from('participants')
      .select('*')
      .eq('wife_email', email)
      .maybeSingle();
    
    // Try lowercase match
    const { data: husbandDataLower } = await supabase
      .from('participants')
      .select('*')
      .eq('husband_email', email.toLowerCase())
      .maybeSingle();
      
    const { data: wifeDataLower } = await supabase
      .from('participants')
      .select('*')
      .eq('wife_email', email.toLowerCase())
      .maybeSingle();
      
    // Use any match we found
    const participantData = husbandData || wifeData || husbandDataIlike || wifeDataIlike || husbandDataLower || wifeDataLower;
    console.log(`Participant data found: ${!!participantData}`);
    
    if (participantData) {
      console.log(`Found participant with ID: ${participantData.id}`);
      console.log(`Husband email in DB: ${participantData.husband_email}`);
      console.log(`Wife email in DB: ${participantData.wife_email}`);
    }
    
    // If the email doesn't belong to a participant, return error
    if (!participantData) {
      console.log('No participant found with this email');
      console.log('Tried exact match, case-insensitive match, and lowercase match');
      return NextResponse.json(
        { error: 'Email not found. Please check your email address or contact support.' },
        { status: 404 }
      );
    }
    
    // Check if access has expired
    console.log('Checking if access has expired');
    if (participantData.access_expires_at) {
      const expirationDate = new Date(participantData.access_expires_at);
      const today = new Date();
      
      // Set both dates to midnight for accurate comparison
      expirationDate.setHours(23, 59, 59, 999);
      today.setHours(0, 0, 0, 0);
      
      console.log(`Access expires at: ${expirationDate.toISOString()}, Today: ${today.toISOString()}`);
      
      if (today > expirationDate) {
        console.log('Access has expired');
        return NextResponse.json(
          { error: 'Your access has expired', redirectTo: '/access-expired' },
          { status: 403 }
        );
      }
    }
    
    // Determine if this is a husband or wife login
    const isHusband = email === participantData.husband_email;
    const storedPassword = isHusband
      ? participantData.husband_temp_password
      : participantData.wife_temp_password;
    
    console.log(`Role: ${isHusband ? 'husband' : 'wife'}`);
    console.log(`Stored password exists: ${!!storedPassword}`);
    
    try {
      // Check if the provided password matches the stored password
      if (password !== storedPassword) {
        console.log('Password does not match stored password, trying direct auth');
        // If not, try to authenticate with Supabase Auth directly
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          console.log('Direct auth failed:', signInError.message);
          return NextResponse.json(
            { error: 'Invalid login credentials. Please check your password and try again.' },
            { status: 401 }
          );
        }
        
        console.log('Direct auth succeeded');
      } else {
        console.log('Password matches stored password, signing in with stored password');
        // If the password matches the stored password, sign in with Supabase Auth
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: storedPassword,
        });
        
        if (signInError) {
          console.error('Error signing in with stored password:', signInError);
          
          // If there's an error with the stored password, try to update the auth account
          const authId = isHusband ? participantData.husband_auth_id : participantData.wife_auth_id;
          
          console.log(`Auth ID exists: ${!!authId}`);
          
          if (authId) {
            console.log('Updating user password in Supabase Auth');
            // Update the user's password in Supabase Auth
            const { error: updateError } = await supabase.auth.admin.updateUserById(
              authId,
              { password: storedPassword }
            );
            
            if (updateError) {
              console.error('Error updating auth password:', updateError);
              return NextResponse.json(
                { error: 'Authentication error. Please contact support.' },
                { status: 500 }
              );
            }
            
            console.log('Password updated, trying to sign in again');
            // Try signing in again with the updated password
            const { error: retryError } = await supabase.auth.signInWithPassword({
              email,
              password: storedPassword,
            });
            
            if (retryError) {
              console.error('Error signing in after password update:', retryError);
              return NextResponse.json(
                { error: 'Authentication error. Please contact support.' },
                { status: 500 }
              );
            }
            
            console.log('Sign in successful after password update');
          } else {
            console.log('No auth ID found, cannot update password');
            return NextResponse.json(
              { error: 'Authentication error. Please contact support.' },
              { status: 500 }
            );
          }
        } else {
          console.log('Sign in with stored password successful');
        }
      }
      
      // Create a session cookie for the client
      console.log('Creating session cookie');
      const authClient = createServerComponentClient({ cookies: () => cookieStore });
      await authClient.auth.getSession();
      
      console.log('Login successful, redirecting to participant dashboard');
      return NextResponse.json(
        { success: true, redirectUrl: '/participant' },
        { status: 200 }
      );
    } catch (innerError) {
      console.error('Unexpected error during authentication process:', innerError);
      return NextResponse.json(
        { error: 'An unexpected error occurred during authentication' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in participant login:', error);
    
    // Provide more detailed error information
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;
    
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
      errorMessage = `Error: ${error.message}`;
      
      // Check for specific error types
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        statusCode = 404;
      } else if (error.message.includes('permission') || error.message.includes('access')) {
        statusCode = 403;
      } else if (error.message.includes('invalid') || error.message.includes('incorrect')) {
        statusCode = 401;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}