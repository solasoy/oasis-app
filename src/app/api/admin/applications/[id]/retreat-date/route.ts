import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { retreat_date } = await request.json();
    
    if (!retreat_date) {
      return NextResponse.json(
        { error: 'Retreat date is required' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('applications')
      .update({ retreat_date })
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating application retreat date:', error);
    return NextResponse.json(
      { error: 'Failed to update application retreat date' },
      { status: 500 }
    );
  }
}