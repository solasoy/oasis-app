import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with admin privileges
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  try {
    const { applicationId, status, profileCreated } = await request.json();
    
    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['approved', 'rejected', 'pending', 'follow_up'].includes(status)) {
      return NextResponse.json(
        { error: `Invalid status value: ${status}` },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: { status: string; profile_created?: boolean } = { status };
    
    // If profileCreated is provided, include it in the update
    if (profileCreated !== undefined) {
      updateData.profile_created = profileCreated;
    }
    
    console.log(`Updating application ${applicationId} with:`, updateData);

    // Update the application status and profile_created flag if provided
    const { data, error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', applicationId)
      .select();

    if (error) {
      console.error('Error updating application status:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `Application ${status} successfully`,
      data
    });
    
  } catch (error) {
    console.error('Error in update-application-status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}