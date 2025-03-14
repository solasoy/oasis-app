import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateTemporaryPassword } from '@/lib/auth-utils';

// Create Supabase client with admin privileges
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  try {
    const { profileId, husbandEmail, wifeEmail } = await request.json();
    
    if (!profileId || !husbandEmail || !wifeEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get profile data for email
    const { data: profile, error: profileError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', profileId)
      .single();
      
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch participant profile' },
        { status: 500 }
      );
    }
    
    // Generate temporary passwords
    const husbandPassword = generateTemporaryPassword();
    const wifePassword = generateTemporaryPassword();
    
    // Create husband account
    const { data: husbandData, error: husbandError } = await supabase.auth.admin.createUser({
      email: husbandEmail,
      password: husbandPassword,
      email_confirm: true,
      user_metadata: {
        profile_id: profileId,
        role: 'participant',
        gender: 'husband'
      }
    });
    
    if (husbandError) {
      console.error('Error creating husband account:', husbandError);
      return NextResponse.json(
        { error: `Failed to create husband account: ${husbandError.message}` },
        { status: 500 }
      );
    }
    
    // Create wife account
    const { data: wifeData, error: wifeError } = await supabase.auth.admin.createUser({
      email: wifeEmail,
      password: wifePassword,
      email_confirm: true,
      user_metadata: {
        profile_id: profileId,
        role: 'participant',
        gender: 'wife'
      }
    });
    
    if (wifeError) {
      console.error('Error creating wife account:', wifeError);
      // If husband account was created but wife account failed, we should delete the husband account
      if (husbandData) {
        await supabase.auth.admin.deleteUser(husbandData.user.id);
      }
      return NextResponse.json(
        { error: `Failed to create wife account: ${wifeError.message}` },
        { status: 500 }
      );
    }
    
    // In a real implementation, we would send welcome emails here
    // For now, we'll just log the credentials for demonstration purposes
    console.log('Husband credentials:', { email: husbandEmail, password: husbandPassword });
    console.log('Wife credentials:', { email: wifeEmail, password: wifePassword });
    
    // Return success response with credentials (in a real app, you wouldn't return passwords)
    return NextResponse.json({
      success: true,
      message: 'Couple accounts created successfully',
      // Only include credentials in development mode
      ...(process.env.NODE_ENV === 'development' && {
        credentials: {
          husband: { email: husbandEmail, password: husbandPassword },
          wife: { email: wifeEmail, password: wifePassword }
        }
      })
    });
    
  } catch (error) {
    console.error('Error creating couple accounts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}