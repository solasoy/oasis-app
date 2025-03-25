import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getParticipantFromSession } from '@/lib/auth-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { checklistItemId, completed } = await request.json();
    
    // In a real implementation, we would get the participant from the session
    // For now, we'll use the participantId from the request
    const { participantId } = await request.json();
    
    if (!participantId || !checklistItemId) {
      return new NextResponse(JSON.stringify({
        error: 'Missing required parameters'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if progress record exists
    const { data: existingProgress } = await supabase
      .from('participant_progress')
      .select('*')
      .eq('participant_id', participantId)
      .eq('checklist_item_id', checklistItemId)
      .single();
    
    if (existingProgress) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('participant_progress')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id);
      
      if (updateError) {
        return new NextResponse(JSON.stringify({
          error: 'Failed to update progress',
          details: updateError.message
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('participant_progress')
        .insert({
          participant_id: participantId,
          checklist_item_id: checklistItemId,
          completed,
          completed_at: completed ? new Date().toISOString() : null
        });
      
      if (insertError) {
        return new NextResponse(JSON.stringify({
          error: 'Failed to create progress record',
          details: insertError.message
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    return new NextResponse(JSON.stringify({
      success: true
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error updating checklist status:', error);
    return new NextResponse(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}