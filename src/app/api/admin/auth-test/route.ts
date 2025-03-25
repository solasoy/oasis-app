import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  // Development mode detection
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Diagnostic information
  const diagnosticInfo = {
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    cookiesAvailable: cookies().getAll().length > 0,
    cookieNames: cookies().getAll().map(c => c.name),
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not Set',
  };
  
  try {
    // In development mode, return diagnostic info without authentication check
    if (isDevelopment) {
      return NextResponse.json({
        success: true,
        message: 'Development mode - authentication check bypassed',
        diagnosticInfo,
        authStatus: 'bypassed'
      });
    }
    
    // Create Supabase client
    const supabase = createServerComponentClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return NextResponse.json({
        success: false,
        message: 'Authentication error',
        error: authError,
        diagnosticInfo,
        authStatus: 'error'
      }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'No authenticated user found',
        diagnosticInfo,
        authStatus: 'no_user'
      }, { status: 401 });
    }
    
    // Check admin status
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', user.email)
      .single();
      
    if (adminError || !adminData) {
      return NextResponse.json({
        success: false,
        message: 'User is not an admin',
        error: adminError,
        diagnosticInfo,
        authStatus: 'not_admin',
        user: { email: user.email }
      }, { status: 403 });
    }
    
    // Success response
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      diagnosticInfo,
      authStatus: 'authenticated',
      user: { email: user.email, id: user.id }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Unexpected error during authentication check',
      error: error instanceof Error ? { message: error.message, name: error.name } : 'Unknown error',
      diagnosticInfo,
      authStatus: 'exception'
    }, { status: 500 });
  }
}