import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  // This endpoint is for development mode only
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }
  
  console.log('Development API: Update Application Status Request Received');
  
  try {
    // Parse request body
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

    // Prepare update data
    const updateData: { status: string; profile_created?: boolean } = { status };
    
    // Include profile_created if provided
    if (profileCreated !== undefined) {
      updateData.profile_created = profileCreated;
    }

    // Perform update using admin client
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

    // Log the successful update
    console.log('Application status updated successfully:', {
      applicationId,
      status,
      profileCreated,
      data
    });

    return NextResponse.json({ 
      success: true,
      message: `Application ${status} successfully (Development Mode)`,
      data 
    });
    
  } catch (error) {
    console.error('Unexpected error in development update-application-status:', error);
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