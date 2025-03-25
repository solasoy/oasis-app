import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    
    // Create a Supabase client with the service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Create a client for the current user's session
    const authClient = createServerComponentClient({ cookies: () => cookieStore });
    
    // Get the current admin user to verify they have admin access
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return new NextResponse(JSON.stringify({
        error: 'Unauthorized - Not logged in'
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verify the user is an admin
    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('email', user.email)
      .maybeSingle();
      
    if (!adminData) {
      return new NextResponse(JSON.stringify({
        error: 'Unauthorized - Not an admin'
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse request body
    const { participantId, role } = await request.json();
    
    if (!participantId || !role || (role !== 'husband' && role !== 'wife')) {
      return new NextResponse(JSON.stringify({
        error: 'Invalid parameters'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get participant data
    const { data: participant, error: fetchError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .single();
    
    if (fetchError || !participant) {
      return new NextResponse(JSON.stringify({
        error: 'Participant not found',
        details: fetchError?.message
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get the appropriate email and password based on role
    const email = role === 'husband' ? participant.husband_email : participant.wife_email;
    const tempPassword = role === 'husband' ? participant.husband_temp_password : participant.wife_temp_password;
    
    if (!email || !tempPassword) {
      return new NextResponse(JSON.stringify({
        error: `No credentials found for ${role}`,
        details: 'The participant account may not have been created yet'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Sign in as the participant
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: tempPassword,
    });
    
    if (signInError) {
      return new NextResponse(JSON.stringify({
        error: 'Failed to access participant account',
        details: signInError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Store admin access info in a secure cookie to track that this is an admin viewing a participant's dashboard
    const adminAccessInfo = {
      isAdminAccess: true,
      adminId: user.id,
      adminEmail: user.email,
      participantId: participant.id,
      participantRole: role,
      participantEmail: email,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString() // 1 hour expiration
    };
    
    // Set a cookie to indicate this is an admin accessing a participant dashboard
    cookieStore.set('admin-access-info', JSON.stringify(adminAccessInfo), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600, // 1 hour
      path: '/'
    });
    
    return new NextResponse(JSON.stringify({
      success: true,
      redirectUrl: '/participant'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error creating admin access:', error);
    return new NextResponse(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}