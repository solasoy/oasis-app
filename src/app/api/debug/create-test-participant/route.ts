import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateMemorablePassword } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Parse request body
    const { husbandEmail, wifeEmail } = await request.json();
    
    if (!husbandEmail || !wifeEmail) {
      return NextResponse.json(
        { error: 'Both husband and wife emails are required' },
        { status: 400 }
      );
    }
    
    // Generate passwords
    const husbandPassword = generateMemorablePassword();
    const wifePassword = generateMemorablePassword();
    
    // Calculate retreat date and expiration date
    const retreatDate = new Date();
    retreatDate.setDate(retreatDate.getDate() + 30); // 30 days from now
    
    const expirationDate = new Date(retreatDate);
    expirationDate.setHours(23, 59, 59, 999);
    
    // Create participant record
    const { data: participant, error: insertError } = await supabase
      .from('participants')
      .insert({
        husband_first_name: 'Test',
        husband_last_name: 'Husband',
        husband_email: husbandEmail,
        wife_first_name: 'Test',
        wife_last_name: 'Wife',
        wife_email: wifeEmail,
        retreat_date: retreatDate.toISOString(),
        access_expires_at: expirationDate.toISOString(),
        husband_temp_password: husbandPassword,
        wife_temp_password: wifePassword,
        husband_password_changed: false,
        wife_password_changed: false,
        status: 'confirmed'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating test participant:', insertError);
      return NextResponse.json(
        { error: 'Failed to create test participant', details: insertError.message },
        { status: 500 }
      );
    }
    
    // Create Supabase Auth accounts
    const { data: husbandUser, error: husbandError } = await supabase.auth.admin.createUser({
      email: husbandEmail,
      password: husbandPassword,
      email_confirm: true
    });
    
    const { data: wifeUser, error: wifeError } = await supabase.auth.admin.createUser({
      email: wifeEmail,
      password: wifePassword,
      email_confirm: true
    });
    
    // Update participant record with auth IDs
    if (husbandUser?.user && wifeUser?.user) {
      const { error: updateError } = await supabase
        .from('participants')
        .update({
          husband_auth_id: husbandUser.user.id,
          wife_auth_id: wifeUser.user.id
        })
        .eq('id', participant.id);
      
      if (updateError) {
        console.error('Error updating participant with auth IDs:', updateError);
      }
    }
    
    return NextResponse.json({
      success: true,
      participant: {
        id: participant.id,
        husbandEmail,
        wifeEmail,
        husbandPassword,
        wifePassword,
        retreatDate: retreatDate.toISOString(),
        expiresAt: expirationDate.toISOString(),
        husbandAuthId: husbandUser?.user?.id || null,
        wifeAuthId: wifeUser?.user?.id || null,
        husbandAuthError: husbandError?.message || null,
        wifeAuthError: wifeError?.message || null
      }
    });
    
  } catch (error) {
    console.error('Error creating test participant:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}