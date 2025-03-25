import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createParticipantAccount, generateMemorablePassword } from '@/lib/auth-utils';

// Create a Supabase client with the service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role key for admin operations
);

export async function POST(request: Request) {
  try {
    const { participantId } = await request.json();
    
    if (!participantId) {
      return new NextResponse(JSON.stringify({
        error: 'Missing participant ID'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get participant data
    const { data: participant, error: fetchError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .single();
    
    if (fetchError || !participant) {
      return new NextResponse(JSON.stringify({
        error: 'Participant not found',
        details: fetchError?.message
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate passwords
    const husbandPassword = generateMemorablePassword();
    const wifePassword = generateMemorablePassword();
    
    // Calculate access expiration date (end of retreat day)
    const retreatDate = new Date(participant.retreat_date);
    const expirationDate = new Date(retreatDate);
    expirationDate.setHours(23, 59, 59, 999);
    
    // Create accounts in Supabase Auth
    const husbandUser = await createParticipantAccount(
      supabase,
      participant.husband_email,
      husbandPassword,
      'husband'
    );
    
    const wifeUser = await createParticipantAccount(
      supabase,
      participant.wife_email,
      wifePassword,
      'wife'
    );
    
    if (!husbandUser || !wifeUser) {
      // If one account was created but the other failed, we should clean up
      if (husbandUser) {
        await supabase.auth.admin.deleteUser(husbandUser.id);
      }
      if (wifeUser) {
        await supabase.auth.admin.deleteUser(wifeUser.id);
      }
      
      return new NextResponse(JSON.stringify({
        error: 'Failed to create one or both participant accounts'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update participant record with auth IDs, passwords, and expiration
    const { error: updateError } = await supabase
      .from('participants')
      .update({
        husband_auth_id: husbandUser.id,
        wife_auth_id: wifeUser.id,
        husband_temp_password: husbandPassword,
        wife_temp_password: wifePassword,
        access_expires_at: expirationDate.toISOString(),
        husband_password_changed: false,
        wife_password_changed: false
      })
      .eq('id', participantId);
    
    if (updateError) {
      // Clean up created auth accounts if participant record update fails
      await supabase.auth.admin.deleteUser(husbandUser.id);
      await supabase.auth.admin.deleteUser(wifeUser.id);
      
      return new NextResponse(JSON.stringify({
        error: 'Failed to update participant record',
        details: updateError.message
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new NextResponse(JSON.stringify({
      success: true,
      data: {
        husbandEmail: participant.husband_email,
        wifeEmail: participant.wife_email,
        husbandPassword,
        wifePassword,
        expiresAt: expirationDate.toISOString()
      }
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error creating participant accounts:', error);
    return new NextResponse(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}