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
    
    // Validate preconditions
    if (!participant.husband_temp_password || !participant.wife_temp_password) {
      return new NextResponse(JSON.stringify({
        error: 'Temporary passwords not set for participant'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if login access is already set
    if (participant.husband_auth_id || participant.wife_auth_id) {
      return new NextResponse(JSON.stringify({
        success: true, // Indicate success, but with a specific status
        status: 'already_set',
        message: 'Login access already set for this participant'
      }), {
        status: 200, // Use 200 OK status
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Calculate access expiration date (end of retreat day)
    const retreatDate = new Date(participant.retreat_date);
    const expirationDate = new Date(retreatDate);
    expirationDate.setHours(23, 59, 59, 999);
    
    console.log('Setting Login Access Debug:', {
      participantId,
      husbandEmail: participant.husband_email,
      wifeEmail: participant.wife_email,
      retreatDate: participant.retreat_date
    });

    // Create accounts in Supabase Auth
    const husbandUser = await createParticipantAccount(
      supabase,
      participant.husband_email,
      participant.husband_temp_password,
      'husband'
    );
    
    let wifeUser = await createParticipantAccount(
      supabase,
      participant.wife_email,
      participant.wife_temp_password,
      'wife'
    );
    
    console.log('Account Creation Results:', {
      husbandUser: husbandUser ? husbandUser.id : null,
      wifeUser: wifeUser ? wifeUser.id : null
    });

    if (!husbandUser || !wifeUser) {
      // Detailed error logging
      console.error('Account Creation Failure', {
        husbandUserCreated: !!husbandUser,
        wifeUserCreated: !!wifeUser,
        husbandEmail: participant.husband_email,
        wifeEmail: participant.wife_email
      });

      // If one account was created but the other failed, we should clean up
      if (husbandUser) {
        await supabase.auth.admin.deleteUser(husbandUser.id);
      }
      if (wifeUser) {
        await supabase.auth.admin.deleteUser(wifeUser.id);
      }
      
      return new NextResponse(JSON.stringify({
        error: 'Failed to create one or both participant accounts',
        details: {
          husbandUserCreated: !!husbandUser,
          wifeUserCreated: !!wifeUser
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Ensure unique auth IDs
    if (husbandUser.id === wifeUser.id) {
      console.error('Duplicate Auth IDs Detected', {
        participantId,
        husbandEmail: participant.husband_email,
        wifeEmail: participant.wife_email,
        authId: husbandUser.id
      });

      // Attempt to create a new account for the wife
      const newWifeUser = await createParticipantAccount(
        supabase,
        participant.wife_email,
        participant.wife_temp_password,
        'wife'
      );

      if (!newWifeUser) {
        console.error('Failed to create unique wife account');
        return new NextResponse(JSON.stringify({
          error: 'Failed to create unique accounts',
          details: 'Duplicate auth IDs detected'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      wifeUser = newWifeUser;
    }
    
    // Update participant record with auth IDs and access expiration
    const { error: updateError } = await supabase
      .from('participants')
      .update({
        husband_auth_id: husbandUser.id,
        wife_auth_id: wifeUser.id,
        access_expires_at: expirationDate.toISOString(),
        husband_password_changed: false,
        wife_password_changed: false
      })
      .eq('id', participantId);

    console.log('Participant Record Update:', {
      success: !updateError,
      error: updateError
    });
    
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
        expiresAt: expirationDate.toISOString()
      }
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error setting participant login access:', error);
    return new NextResponse(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}