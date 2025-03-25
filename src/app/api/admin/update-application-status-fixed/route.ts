import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Create Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  // Development mode detection
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Diagnostic logging for development
  if (isDevelopment) {
    console.log('Update Application Status Request Received');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Cookies:', cookies().getAll().map(c => c.name));
  }

  try {
    // Parse request body first to avoid issues
    const requestBody = await request.text();
    console.log('Raw request body:', requestBody);

    let body;
    try {
      body = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid JSON', 
          rawBody: requestBody 
        },
        { status: 400 }
      );
    }

    const { applicationId, status, profileCreated } = body;
    
    // Validate input
    if (!applicationId || !status) {
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          received: body 
        },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['approved', 'rejected', 'pending', 'follow_up'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          error: `Invalid status value: ${status}`, 
          validStatuses 
        },
        { status: 400 }
      );
    }

    // In development mode, bypass authentication checks
    if (isDevelopment) {
      console.log('Development mode detected, bypassing authentication checks');
      
      // Prepare update data
      const updateData: { status: string; profile_created?: boolean } = { status };
      
      // Include profile_created if provided
      if (profileCreated !== undefined) {
        updateData.profile_created = profileCreated;
      }

      // Perform update
      const { data, error } = await supabaseAdmin
        .from('applications')
        .update(updateData)
        .eq('id', applicationId)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        return NextResponse.json(
          { 
            error: error.message, 
            details: error 
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true,
        message: `Application ${status} successfully (Development Mode)`,
        data 
      });
    }
    
    // Production mode - verify authentication
    const supabase = createServerComponentClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { 
          error: 'Unauthorized access', 
          details: authError 
        },
        { status: 401 }
      );
    }

    // Check if user is in admins table
    const { data: adminCheck, error: adminCheckError } = await supabase
      .from('admins')
      .select('id')
      .eq('email', user.email)
      .single();

    if (adminCheckError || !adminCheck) {
      console.error('Admin check error:', adminCheckError);
      return NextResponse.json(
        { 
          error: 'Access denied', 
          details: adminCheckError 
        },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: { status: string; profile_created?: boolean } = { status };
    
    // Include profile_created if provided
    if (profileCreated !== undefined) {
      updateData.profile_created = profileCreated;
    }

    // Perform update
    const { data, error } = await supabaseAdmin
      .from('applications')
      .update(updateData)
      .eq('id', applicationId)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { 
          error: error.message, 
          details: error 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `Application ${status} successfully`,
      data 
    });
    
  } catch (error) {
    console.error('Unexpected error in update-application-status:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}