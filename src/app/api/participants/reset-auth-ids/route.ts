import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createParticipantAccount } from '@/lib/auth-utils';

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
    
    console.log('Resetting Auth IDs for participant:', {
      participantId,
      husbandEmail: participant.husband_email,
      wifeEmail: participant.wife_email,
      currentAuthIds: {
        husband: participant.husband_auth_id,
        wife: participant.wife_auth_id
      }
    });

    // Delete existing auth accounts if they exist
    if (participant.husband_auth_id) {
      await supabase.auth.admin.deleteUser(participant.husband_auth_id);
    }
    if (participant.wife_auth_id) {
      await supabase.auth.admin.deleteUser(participant.wife_auth_id);
    }
    
    // Create new accounts in Supabase Auth
    const husbandUser = await createParticipantAccount(
      supabase,
      participant.husband_email,
      participant.husband_temp_password,
      'husband'
    );
    
    const wifeUser = await createParticipantAccount(
      supabase,
      participant.wife_email,
      participant.wife_temp_password,
      'wife'
    );
    
    console.log('New Auth Accounts Created:', {
      husbandId: husbandUser?.id,
      wifeId: wifeUser?.id
    });

    if (!husbandUser || !wifeUser) {
      return new NextResponse(JSON.stringify({
        error: 'Failed to create new auth accounts',
        details: {
          husbandCreated: !!husbandUser,
          wifeCreated: !!wifeUser
        }
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verify the IDs are different
    if (husbandUser.id === wifeUser.id) {
      return new NextResponse(JSON.stringify({
        error: 'Failed to create unique auth accounts',
        details: 'Generated duplicate auth IDs'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update participant record with new auth IDs
    const { error: updateError } = await supabase
      .from('participants')
      .update({
        husband_auth_id: husbandUser.id,
        wife_auth_id: wifeUser.id,
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
        husbandAuthId: husbandUser.id,
        wifeAuthId: wifeUser.id,
        husbandEmail: participant.husband_email,
        wifeEmail: participant.wife_email
      }
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error resetting auth IDs:', error);
    return new NextResponse(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}