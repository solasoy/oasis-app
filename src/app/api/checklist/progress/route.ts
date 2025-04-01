import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getParticipantFromSession } from '@/lib/auth-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Try to get participant from session first
    const sessionParticipantId = getParticipantFromSession();
    
    // Fallback to query parameters if no participant found in session
    const url = new URL(request.url);
    const queryParticipantId = url.searchParams.get('participantId');
    
    const participantId = sessionParticipantId || queryParticipantId;
    
    if (!participantId) {
      // Log detailed information only in non-production environments
      if (process.env.NODE_ENV !== 'production') {
        console.error('No participant ID found', {
          sessionParticipantId,
          queryParticipantId,
          requestUrl: request.url
        });
      }
      
      return new NextResponse(JSON.stringify({
        error: 'Unable to retrieve participant ID',
        details: process.env.NODE_ENV !== 'production' ? {
          sessionParticipantId: !!sessionParticipantId,
          queryParticipantId: !!queryParticipantId
        } : undefined
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get all checklist items
    const { data: checklistItems, error: itemsError } = await supabase
      .from('checklist_items')
      .select('*');
    
    if (itemsError) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to fetch checklist items', {
          error: itemsError,
          participantId
        });
      }
      
      return new NextResponse(JSON.stringify({
        error: 'Failed to fetch checklist items',
        details: process.env.NODE_ENV !== 'production' ? itemsError.message : undefined
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
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to fetch participant progress', {
          error: progressError,
          participantId
        });
      }
      
      return new NextResponse(JSON.stringify({
        error: 'Failed to fetch participant progress',
        details: process.env.NODE_ENV !== 'production' ? progressError.message : undefined
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
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to fetch participant data', {
          error: participantError,
          participantId
        });
      }
      
      return new NextResponse(JSON.stringify({
        error: 'Failed to fetch participant data',
        details: process.env.NODE_ENV !== 'production' ? participantError.message : undefined
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
    // Log full error details only in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      console.error('Unexpected error in progress route', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
    
    return new NextResponse(JSON.stringify({
      error: 'Internal server error',
      details: process.env.NODE_ENV !== 'production' && error instanceof Error 
        ? error.message 
        : undefined
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
