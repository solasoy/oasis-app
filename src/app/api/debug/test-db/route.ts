import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    console.log('Testing database connection');
    
    // Log environment variables (masked)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Not set'}`);
    console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? 'Set (length: ' + supabaseKey.length + ')' : 'Not set'}`);
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing Supabase configuration',
        details: {
          url: supabaseUrl ? 'Set' : 'Not set',
          key: supabaseKey ? 'Set' : 'Not set'
        }
      }, { status: 500 });
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client created');
    
    // Test connection by listing tables
    const { data: tables, error: tablesError } = await supabase
      .from('_tables')
      .select('*');
      
    if (tablesError) {
      console.error('Error listing tables:', tablesError);
      
      // Try a different approach - get system tables
      const { data: systemInfo, error: systemError } = await supabase.rpc('get_system_info');
      
      if (systemError) {
        console.error('Error getting system info:', systemError);
        
        // Try a direct query to a known table
        const { data: participants, error: participantsError } = await supabase
          .from('participants')
          .select('count(*)')
          .limit(1);
          
        if (participantsError) {
          console.error('Error querying participants:', participantsError);
          
          return NextResponse.json({
            success: false,
            error: 'Database connection failed',
            details: {
              tablesError: tablesError.message,
              systemError: systemError.message,
              participantsError: participantsError.message
            }
          }, { status: 500 });
        }
        
        return NextResponse.json({
          success: true,
          message: 'Connected to database, but could not list tables or get system info',
          participantsCount: participants
        });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Connected to database, but could not list tables',
        systemInfo
      });
    }
    
    // Try to get all participants
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('id, husband_email, wife_email')
      .limit(10);
      
    if (participantsError) {
      console.error('Error querying participants:', participantsError);
      
      return NextResponse.json({
        success: true,
        message: 'Connected to database, but could not query participants',
        tables,
        participantsError: participantsError.message
      });
    }
    
    // Try a raw SQL query
    const { data: rawData, error: rawError } = await supabase.rpc(
      'execute_sql',
      { sql: 'SELECT * FROM participants LIMIT 5' }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tables,
      participants,
      rawQueryResult: rawError ? { error: rawError.message } : rawData
    });
    
  } catch (error) {
    console.error('Error testing database connection:', error);
    
    return NextResponse.json({
      success: false,
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}