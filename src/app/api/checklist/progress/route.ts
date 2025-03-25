import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getParticipantFromSession } from '@/lib/auth-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // In a real implementation, we would get the participant from the session
    // For now, we'll use the participantId from the query parameters
    const url = new URL(request.url);
    const participantId = url.searchParams.get('participantId');
    
    if (!participantId) {
      return new NextResponse(JSON.stringify({
        error: 'Missing participant ID'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get all checklist items
    const { data: checklistItems, error: itemsError } = await supabase
      .from('checklist_items')
      .select('*');
    
    if (itemsError) {
      return new NextResponse(JSON.stringify({
        error: 'Failed to fetch checklist items',
        details: itemsError.message
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get participant progress
    const { data: progress, error: progressError } = await supabase
      .from('participant_progress')
      .select('*')
      .eq('participant_id', participantId);
    
    if (progressError) {
      return new NextResponse(JSON.stringify({
        error: 'Failed to fetch participant progress',
        details: progressError.message
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get participant data to determine role
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .single();
    
    if (participantError) {
      return new NextResponse(JSON.stringify({
        error: 'Failed to fetch participant data',
        details: participantError.message
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Filter items based on role
    const isHusband = participant.husband_email === participant.email;
    const role = isHusband ? 'husband' : 'wife';
    
    const filteredItems = checklistItems.filter(item => 
      item.type === 'couple' || item.required_role === role
    );
    
    // Calculate progress
    const totalItems = filteredItems.length;
    const completedItems = progress.filter(p => 
      p.completed && filteredItems.some(item => item.id === p.checklist_item_id)
    ).length;
    
    return new NextResponse(JSON.stringify({
      success: true,
      totalItems,
      completedItems,
      percentComplete: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching progress:', error);
    return new NextResponse(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}