import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This is a one-time setup endpoint to create the retreat_dates table
// You should disable or remove this after use for security reasons

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

    // SQL to create the retreat_dates table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS retreat_dates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        display_name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Check if the retreat_dates table already exists
    const { error } = await supabase
      .from('retreat_dates')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') { // 42P01 is the PostgreSQL error code for "table does not exist"
      // Table doesn't exist, create it
      const { error: createError } = await supabase.rpc('pgcrypto_extensions');
      if (createError) {
        console.error('Error enabling pgcrypto extensions:', createError);
      }

      const { error: tableError } = await supabase.rpc('create_retreat_dates_table', {
        sql: createTableSQL
      });

      if (tableError) {
        console.error('Error creating retreat_dates table:', tableError);
        return NextResponse.json(
          { error: tableError.message },
          { status: 500 }
        );
      }

      // Seed the table with the current retreat date
      const { error: seedError } = await supabase
        .from('retreat_dates')
        .insert({
          start_date: '2025-03-05',
          end_date: '2025-03-09',
          display_name: 'March 5-9, 2025',
          is_active: true
        });

      if (seedError) {
        console.error('Error seeding retreat_dates table:', seedError);
        return NextResponse.json(
          { error: seedError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Retreat dates table created and seeded successfully',
        status: 'created'
      });
    } else if (error) {
      console.error('Error checking retreat_dates table:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    } else {
      // Table already exists
      return NextResponse.json({
        message: 'Retreat dates table already exists',
        status: 'exists'
      });
    }
  } catch (error) {
    console.error('Error in setup-retreat-dates-table:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}