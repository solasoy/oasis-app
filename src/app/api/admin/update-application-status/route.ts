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
  // Diagnostic logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Update Application Status Request Received');
    console.log('Cookies:', cookies().getAll());
  }

  try {
    // Create server-side Supabase client
    const supabase = createServerComponentClient({ cookies });

    // Verify user authentication with enhanced logging
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication Error Details:', {
        error: authError,
        userExists: !!user,
        environment: process.env.NODE_ENV
      });

      return NextResponse.json(
        { 
          error: 'Authentication Failed', 
          details: {
            message: authError?.message || 'No authenticated user found',
            code: authError?.code
          }
        },
        { status: 401 }
      );
    }

    // Detailed admin check with comprehensive logging
    const { data: adminCheck, error: adminCheckError } = await supabase
      .from('admins')
      .select('id, email')
      .eq('email', user.email)
      .single();

    if (adminCheckError || !adminCheck) {
      console.error('Admin Access Denied:', {
        error: adminCheckError,
        userEmail: user.email,
        adminCheckResult: !!adminCheck
      });

      return NextResponse.json(
        { 
          error: 'Access Denied', 
          details: {
            message: 'User is not authorized as an admin',
            userEmail: user.email
          }
        },
        { status: 403 }
      );
    }

    // Parse request body with enhanced error handling
    const requestBody = await request.text();
    console.log('Raw Request Body:', requestBody);

    let body;
    try {
      body = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('JSON Parsing Error:', {
        error: parseError,
        rawBody: requestBody
      });

      return NextResponse.json(
        { 
          error: 'Invalid Request', 
          details: {
            message: 'Unable to parse request body',
            rawBody: requestBody
          }
        },
        { status: 400 }
      );
    }

    const { applicationId, status, profileCreated } = body;
    
    // Input validation with detailed error response
    if (!applicationId || !status) {
      return NextResponse.json(
        { 
          error: 'Validation Failed', 
          details: {
            message: 'Missing required fields',
            receivedData: body
          }
        },
        { status: 400 }
      );
    }

    // Status validation
    const validStatuses = ['approved', 'rejected', 'pending', 'follow_up'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          error: 'Invalid Status', 
          details: {
            message: `Provided status '${status}' is not allowed`,
            validStatuses
          }
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: { status: string; profile_created?: boolean } = { status };
    
    // Include profile_created if provided
    if (profileCreated !== undefined) {
      updateData.profile_created = profileCreated;
    }

    // Perform update with detailed error handling
    const { data, error } = await supabaseAdmin
      .from('applications')
      .update(updateData)
      .eq('id', applicationId)
      .select();

    if (error) {
      console.error('Supabase Update Error:', {
        error,
        updateData,
        applicationId
      });

      return NextResponse.json(
        { 
          error: 'Update Failed', 
          details: {
            message: error.message,
            code: error.code
          }
        },
        { status: 500 }
      );
    }

    // Successful response
    return NextResponse.json({ 
      success: true,
      message: `Application ${status} successfully`,
      data 
    });
    
  } catch (unexpectedError) {
    console.error('Unexpected Error in Update Application Status:', {
      error: unexpectedError,
      environment: process.env.NODE_ENV
    });

    return NextResponse.json(
      { 
        error: 'Unexpected Error', 
        details: {
          message: unexpectedError instanceof Error ? unexpectedError.message : 'Unknown error occurred',
          environment: process.env.NODE_ENV
        }
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