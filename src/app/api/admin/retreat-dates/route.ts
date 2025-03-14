import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateRetreatDate } from '@/lib/validation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('retreat_dates')
      .select('*')
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching retreat dates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch retreat dates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { start_date, end_date, display_name } = await request.json();
    
    // Validate input
    if (!start_date || !end_date || !display_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate start date is in the future using our centralized validation function
    const startDateErrors = validateRetreatDate(start_date);
    if (startDateErrors.length > 0) {
      return NextResponse.json(
        { error: startDateErrors[0].message },
        { status: 400 }
      );
    }
    
    // Also validate that end date is after start date
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (endDate < startDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('retreat_dates')
      .insert({
        start_date,
        end_date,
        display_name,
        is_active: true
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error creating retreat date:', error);
    return NextResponse.json(
      { error: 'Failed to create retreat date' },
      { status: 500 }
    );
  }
}