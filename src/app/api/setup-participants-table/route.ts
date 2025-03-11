import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This is a one-time setup endpoint to create the participants table
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

    // SQL to create the participants table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS participants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        application_id UUID REFERENCES applications(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        retreat_date DATE NOT NULL,
        
        -- Husband information
        husband_first_name TEXT NOT NULL,
        husband_last_name TEXT NOT NULL,
        husband_email TEXT NOT NULL,
        
        -- Wife information
        wife_first_name TEXT NOT NULL,
        wife_last_name TEXT NOT NULL,
        wife_email TEXT NOT NULL,
        
        -- Payment information
        fee_amount DECIMAL(10, 2) NOT NULL,
        has_payment_plan BOOLEAN DEFAULT FALSE,
        
        -- Fixed payment plan details
        payment_plan_type TEXT CHECK (payment_plan_type IN ('fixed', 'variable') OR payment_plan_type IS NULL),
        payment_cadence TEXT CHECK (payment_cadence IN ('weekly', 'biweekly', 'monthly') OR payment_cadence IS NULL),
        
        -- Variable payment plan details
        number_of_payments INTEGER,
        variable_payments JSONB, -- Array of {amount, dueDate} objects
        
        UNIQUE(application_id)
      );
    `;

    // Check if the participants table already exists
    const { error } = await supabase
      .from('participants')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') { // 42P01 is the PostgreSQL error code for "table does not exist"
      // Table doesn't exist, return the SQL to create it
      return NextResponse.json({
        message: 'Participants table needs to be created',
        status: 'not_exists',
        sql: createTableSQL
      });
    } else if (error) {
      console.error('Error checking participants table:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    } else {
      // Table already exists
      return NextResponse.json({
        message: 'Participants table already exists',
        status: 'exists'
      });
    }

    return NextResponse.json({ 
      message: 'Participants table created successfully'
    });
    
  } catch (error) {
    console.error('Error in setup-participants-table:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}