import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    console.log('Direct login attempt started');
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
    
    // Get all participants to debug
    const { data: allParticipants } = await supabase
      .from('participants')
      .select('id, husband_email, wife_email')
      .limit(10);
      
    console.log('All participants:', JSON.stringify(allParticipants, null, 2));
    
    // Find participant by email (case-insensitive)
    const manualMatch = allParticipants?.find(p => 
      (p.husband_email && p.husband_email.toLowerCase() === email.toLowerCase()) || 
      (p.wife_email && p.wife_email.toLowerCase() === email.toLowerCase())
    );
    
    if (!manualMatch) {
      console.log('No participant found with this email');
      return NextResponse.json(
        { error: 'Email not found. Please check your email address or contact support.' },
        { status: 404 }
      );
    }
    
    console.log(`Found match manually with ID: ${manualMatch.id}`);
    
    // Get full participant data
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', manualMatch.id)
      .single();
      
    if (participantError || !participant) {
      console.error('Error getting participant details:', participantError);
      return NextResponse.json(
        { error: 'Error retrieving participant details. Please try again.' },
        { status: 500 }
      );
    }
    
    console.log(`Participant data: ${JSON.stringify({
      husband_email: participant.husband_email,
      wife_email: participant.wife_email,
      husband_auth_id: participant.husband_auth_id,
      wife_auth_id: participant.wife_auth_id,
      husband_temp_password: participant.husband_temp_password ? 'exists' : 'missing',
      wife_temp_password: participant.wife_temp_password ? 'exists' : 'missing',
    })}`);
    
    // Determine if this is a husband or wife login
    const isHusband = participant.husband_email && 
      participant.husband_email.toLowerCase() === email.toLowerCase();
    console.log(`Role: ${isHusband ? 'husband' : 'wife'}`);
    
    // Get the stored password
    const storedPassword = isHusband 
      ? participant.husband_temp_password 
      : participant.wife_temp_password;
      
    console.log(`Stored password exists: ${!!storedPassword}`);
    
    // Check if the provided password matches the stored password
    if (password !== storedPassword) {
      console.log('Password does not match stored password');
      return NextResponse.json(
        { error: 'Invalid password. Please check your password and try again.' },
        { status: 401 }
      );
    }
    
    console.log('Password matches stored password');
    
    // Get the auth ID
    const authId = isHusband ? participant.husband_auth_id : participant.wife_auth_id;
    console.log(`Auth ID exists: ${!!authId}`);
    
    if (!authId) {
      console.log('No auth ID found, cannot log in');
      return NextResponse.json(
        { error: 'Authentication error. Please contact support.' },
        { status: 500 }
      );
    }
    
    // Sign in with the user's credentials
    console.log('Signing in with credentials');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: storedPassword
    });
    
    if (signInError) {
      console.error('Error signing in:', signInError);
      
      // Try to update the user's password and sign in again
      console.log('Updating user password and trying again');
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        authId,
        { password: storedPassword }
      );
      
      if (updateError) {
        console.error('Error updating password:', updateError);
        return NextResponse.json(
          { error: 'Authentication error. Please contact support.' },
          { status: 500 }
        );
      }
      
      // Try signing in again
      const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
        email,
        password: storedPassword
      });
      
      if (retryError) {
        console.error('Error signing in after password update:', retryError);
        return NextResponse.json(
          { error: 'Authentication error. Please contact support.' },
          { status: 500 }
        );
      }
    }
    
    // Get the session
    const { data: sessionData } = await supabase.auth.getSession();
    
    console.log('Session data:', sessionData.session ? 'exists' : 'does not exist');
    
    if (sessionData.session) {
      // Set the session cookie manually
      cookieStore.set('sb-access-token', sessionData.session.access_token, {
        path: '/',
        maxAge: sessionData.session.expires_in
      });
      
      cookieStore.set('sb-refresh-token', sessionData.session.refresh_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }
    
    console.log('Login successful, redirecting to participant dashboard');
    return NextResponse.json(
      { success: true, redirectUrl: '/participant' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error in direct login:', error);
    
    // Provide more detailed error information
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;
    
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
      errorMessage = `Error: ${error.message}`;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}