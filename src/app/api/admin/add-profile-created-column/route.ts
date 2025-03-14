import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode' },
        { status: 403 }
      );
    }

    // Create Supabase client with admin privileges
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Check if the column already exists
    try {
      const { data: columnExists, error: checkError } = await supabase
        .from('applications')
        .select('profile_created')
        .limit(1);

      // If no error, the column exists
      if (!checkError) {
        return NextResponse.json({
          success: true,
          message: 'profile_created column already exists in applications table'
        });
      }

      // If error is not "column does not exist", it's a different error
      if (checkError.code !== '42703') {
        console.error('Error checking column:', checkError);
        return NextResponse.json(
          { error: checkError.message },
          { status: 500 }
        );
      }

      // If we get here, the column doesn't exist (error code 42703)
    } catch (error) {
      console.error('Error checking if column exists:', error);
      // Continue to the next step - we'll assume the column doesn't exist
    }

    // Since we can't execute raw SQL directly through the API, we'll provide the SQL for the user to run
    return NextResponse.json({
      success: false,
      error: 'Could not add profile_created column automatically. Please run the following SQL in your Supabase SQL Editor:',
      sql: `
-- Add profile_created column to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS profile_created BOOLEAN DEFAULT FALSE;

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'applications' AND column_name = 'profile_created';
      `
    });
    
  } catch (error) {
    console.error('Error in add-profile-created-column:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}