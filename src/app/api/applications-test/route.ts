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
    // Create Supabase client
    const supabase = createServerComponentClient({ cookies });
    
    // In development mode, bypass authentication checks
    if (isDevelopment) {
      console.log('Development mode detected, bypassing authentication checks');
      
      // Fetch applications without authentication checks
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json({
          success: false,
          message: 'Error fetching applications',
          error,
          diagnosticInfo
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Applications fetched successfully (Development Mode)',
        data,
        count: data.length,
        diagnosticInfo
      });
    }
    
    // Production mode - check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json({
        success: false,
        message: 'Authentication failed',
        error: authError,
        diagnosticInfo
      }, { status: 401 });
    }
    
    // Check if user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', user.email)
      .single();
    
    if (adminError || !adminData) {
      console.error('Admin check error:', adminError);
      return NextResponse.json({
        success: false,
        message: 'Access denied',
        error: adminError,
        diagnosticInfo
      }, { status: 403 });
    }
    
    // Fetch applications
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json({
        success: false,
        message: 'Error fetching applications',
        error,
        diagnosticInfo
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Applications fetched successfully',
      data,
      count: data.length
    });
    
  } catch (error) {
    console.error('Unexpected error in applications API:', error);
    return NextResponse.json({
      success: false,
      message: 'Unexpected error',
      error: error instanceof Error ? { message: error.message, name: error.name } : 'Unknown error',
      diagnosticInfo
    }, { status: 500 });
  }
}