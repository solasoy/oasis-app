import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const GET = async (request: Request) => {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Try a simple query
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .limit(1);

    return new NextResponse(JSON.stringify({
      message: 'Supabase test endpoint',
      connection: 'success',
      data: data,
      error: error,
      env: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    return new NextResponse(JSON.stringify({
      message: 'Supabase test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}; 