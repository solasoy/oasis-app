import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const now = new Date();
    
    // Get active retreat dates with start date in the future
    const { data, error } = await supabase
      .from('retreat_dates')
      .select('*')
      .eq('is_active', true)
      .gte('start_date', now.toISOString().split('T')[0])
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