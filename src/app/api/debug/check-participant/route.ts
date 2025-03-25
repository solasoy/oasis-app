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
    const email = searchParams.get('email') || 'barryj@email.com';
    
    console.log(`Checking for participant with email: ${email}`);
    
    // Get all participants
    const { data: allParticipants, error: allError } = await supabase
      .from('participants')
      .select('id, husband_email, wife_email')
      .limit(20);
      
    if (allError) {
      console.error('Error fetching all participants:', allError);
      return NextResponse.json(
        { error: 'Failed to fetch participants', details: allError.message },
        { status: 500 }
      );
    }
    
    // Check for exact match
    const exactMatch = allParticipants?.find(p => 
      p.husband_email === email || p.wife_email === email
    );
    
    // Check for case-insensitive match
    const caseInsensitiveMatch = allParticipants?.find(p => 
      p.husband_email?.toLowerCase() === email.toLowerCase() || 
      p.wife_email?.toLowerCase() === email.toLowerCase()
    );
    
    // Get specific participant if found
    let participantDetails = null;
    if (exactMatch || caseInsensitiveMatch) {
      const matchId = (exactMatch || caseInsensitiveMatch)?.id;
      const { data: details, error: detailsError } = await supabase
        .from('participants')
        .select('*')
        .eq('id', matchId)
        .single();
        
      if (detailsError) {
        console.error('Error fetching participant details:', detailsError);
      } else {
        participantDetails = {
          id: details.id,
          husband_email: details.husband_email,
          wife_email: details.wife_email,
          husband_auth_id: details.husband_auth_id,
          wife_auth_id: details.wife_auth_id,
          husband_temp_password: details.husband_temp_password,
          wife_temp_password: details.wife_temp_password,
          access_expires_at: details.access_expires_at
        };
      }
    }
    
    // Check database schema
    const { data: tableInfo, error: tableError } = await supabase
      .from('participants')
      .select('*')
      .limit(1);
      
    const schema = tableInfo && tableInfo.length > 0 
      ? Object.keys(tableInfo[0]) 
      : [];
    
    return NextResponse.json({
      email,
      totalParticipants: allParticipants?.length || 0,
      exactMatch: !!exactMatch,
      caseInsensitiveMatch: !!caseInsensitiveMatch,
      allParticipants,
      participantDetails,
      tableSchema: schema
    });
    
  } catch (error) {
    console.error('Error checking participant:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}