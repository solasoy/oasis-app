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
    // For now, we'll use a mock implementation
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
      .select('*')
      .order('order_index', { ascending: true });
    
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
    
    // Combine items with progress
    const itemsWithProgress = checklistItems.map(item => {
      const progressItem = progress.find(p => p.checklist_item_id === item.id);
      return {
        ...item,
        completed: progressItem ? progressItem.completed : false,
        completedAt: progressItem ? progressItem.completed_at : null
      };
    });
    
    return new NextResponse(JSON.stringify({
      success: true,
      data: itemsWithProgress
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error fetching checklist items:', error);
    return new NextResponse(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}