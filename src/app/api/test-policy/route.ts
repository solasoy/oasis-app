import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    // Simple test data with all required fields
    const testData = {
      status: 'test',
      retreat_date: '2025-01-01',
      his_name: { first: 'Test', last: 'User' },
      his_age: '30s',
      his_phone: '123-456-7890',
      his_email: 'test@example.com',
      her_name: { first: 'Test', last: 'User' },
      her_age: '30s',
      her_phone: '123-456-7890',
      her_email: 'test@example.com',
      address: {
        line1: '123 Test St',
        line2: '',
        city: 'Test City',
        state: 'TS',
        postal: '12345',
        country: 'US'
      },
      is_occ_member: 'yes',
      is_christ_follower: 'yes',
      wedding_date: '2020-01-01',
      living_arrangement: 'Together',
      children: 'None',
      previous_marriage: 'No',
      retreat_reason: 'Testing',
      previous_therapy: 'No',
      submitted_at: new Date().toISOString()
    };

    console.log('Attempting to insert test data:', testData);

    const { data, error } = await supabase
      .from('applications')
      .insert([testData])
      .select()
      .single();

    if (error) {
      console.error('Test insert failed:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json({ 
        error: 'Insert failed',
        details: error.message,
        code: error.code
      }, { 
        status: 400 
      });
    }

    console.log('Insert successful:', data);

    return NextResponse.json({ 
      success: true, 
      message: 'Test insert successful',
      data 
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { 
      status: 500 
    });
  }
}

export async function GET(request: Request) {
  try {
    console.log('Testing database connection and structure...');

    // Test basic connection
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // Test table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('applications')
      .select(`
        id,
        created_at,
        status,
        submitted_at,
        his_name,
        his_age,
        his_phone,
        his_email,
        her_name,
        her_age,
        her_phone,
        her_email,
        address,
        is_occ_member,
        is_christ_follower,
        wedding_date,
        living_arrangement,
        children,
        previous_marriage,
        retreat_reason,
        previous_therapy,
        retreat_date
      `)
      .limit(1)
      .single();

    if (tableError) {
      console.error('Table structure test failed:', {
        message: tableError.message,
        code: tableError.code,
        details: tableError.details,
        hint: tableError.hint
      });
      return NextResponse.json({
        error: 'Table structure test failed',
        details: tableError.message,
        code: tableError.code
      }, { 
        status: 500 
      });
    }

    // Test RLS policies
    const { data: policyTest, error: policyError } = await supabase
      .from('applications')
      .select('count');

    if (policyError) {
      console.error('Policy test failed:', {
        message: policyError.message,
        code: policyError.code,
        details: policyError.details,
        hint: policyError.hint
      });
      return NextResponse.json({
        error: 'Policy test failed',
        details: policyError.message,
        code: policyError.code
      }, { 
        status: 500 
      });
    }

    return NextResponse.json({
      success: true,
      message: 'All database tests passed',
      structure: {
        hasData: !!tableInfo,
        columns: Object.keys(tableInfo || {})
      },
      policies: {
        canRead: !policyError,
        rowCount: policyTest?.[0]?.count
      }
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      error: 'Connection test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { 
      status: 500 
    });
  }
} 