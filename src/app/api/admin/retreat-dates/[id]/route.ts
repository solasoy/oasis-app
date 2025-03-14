import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateRetreatDate } from '@/lib/validation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updateData = await request.json();
    
    // Validate that we have at least one field to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }
    
    // If updating start date, validate it's in the future
    if (updateData.start_date) {
      const startDateErrors = validateRetreatDate(updateData.start_date);
      if (startDateErrors.length > 0) {
        return NextResponse.json(
          { error: startDateErrors[0].message },
          { status: 400 }
        );
      }
      
      // If also updating end date, ensure it's after start date
      if (updateData.end_date) {
        const startDate = new Date(updateData.start_date);
        const endDate = new Date(updateData.end_date);
        if (endDate < startDate) {
          return NextResponse.json(
            { error: 'End date must be after start date' },
            { status: 400 }
          );
        }
      }
    }
    // If only updating end date (not start date), need to fetch current start date to compare
    else if (updateData.end_date) {
      const { data: currentDate, error: fetchError } = await supabase
        .from('retreat_dates')
        .select('start_date')
        .eq('id', params.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const startDate = new Date(currentDate.start_date);
      const endDate = new Date(updateData.end_date);
      if (endDate < startDate) {
        return NextResponse.json(
          { error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('retreat_dates')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating retreat date:', error);
    return NextResponse.json(
      { error: 'Failed to update retreat date' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if this retreat date is being used by any applications
    const { data: applications, error: checkError } = await supabase
      .from('applications')
      .select('id')
      .eq('retreat_date', params.id)
      .limit(1);
    
    if (checkError) throw checkError;
    
    // If applications are using this retreat date, don't allow deletion
    if (applications && applications.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete retreat date that is being used by applications' },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from('retreat_dates')
      .delete()
      .eq('id', params.id);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting retreat date:', error);
    return NextResponse.json(
      { error: 'Failed to delete retreat date' },
      { status: 500 }
    );
  }
}