import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Get the email from the query string
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }
    
    console.log(`Checking if participant exists with email: ${email}`);
    
    // Check husband_email
    const { data: husbandData, error: husbandError } = await supabase
      .from('participants')
      .select('id, husband_first_name, husband_email, husband_auth_id, husband_temp_password')
      .eq('husband_email', email)
      .maybeSingle();
      
    if (husbandError) {
      console.error('Error checking husband_email:', husbandError);
    }
    
    // Check wife_email
    const { data: wifeData, error: wifeError } = await supabase
      .from('participants')
      .select('id, wife_first_name, wife_email, wife_auth_id, wife_temp_password')
      .eq('wife_email', email)
      .maybeSingle();
      
    if (wifeError) {
      console.error('Error checking wife_email:', wifeError);
    }
    
    // List all participants for debugging
    const { data: allParticipants, error: listError } = await supabase
      .from('participants')
      .select('id, husband_email, wife_email')
      .limit(10);
      
    if (listError) {
      console.error('Error listing participants:', listError);
    }
    
    return NextResponse.json({
      found: !!(husbandData || wifeData),
      asHusband: !!husbandData,
      asWife: !!wifeData,
      husbandData: husbandData ? {
        id: husbandData.id,
        name: husbandData.husband_first_name,
        email: husbandData.husband_email,
        hasAuthId: !!husbandData.husband_auth_id,
        hasTempPassword: !!husbandData.husband_temp_password
      } : null,
      wifeData: wifeData ? {
        id: wifeData.id,
        name: wifeData.wife_first_name,
        email: wifeData.wife_email,
        hasAuthId: !!wifeData.wife_auth_id,
        hasTempPassword: !!wifeData.wife_temp_password
      } : null,
      allParticipantsCount: allParticipants?.length || 0,
      sampleEmails: allParticipants?.map(p => ({ 
        husband: p.husband_email, 
        wife: p.wife_email 
      })) || []
    });
    
  } catch (error) {
    console.error('Error checking participant:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}