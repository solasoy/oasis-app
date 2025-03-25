import { NextResponse } from 'next/server';

export async function GET() {
  // Get the Supabase URL and mask it for security
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set';
  const maskedUrl = supabaseUrl !== 'Not set' 
    ? `${supabaseUrl.substring(0, 8)}...${supabaseUrl.substring(supabaseUrl.length - 5)}` 
    : 'Not set';
  
  // Get the Supabase keys and mask them for security
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'Not set';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'Not set';
  
  const maskedAnonKey = supabaseAnonKey !== 'Not set'
    ? `${supabaseAnonKey.substring(0, 5)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 5)}`
    : 'Not set';
    
  const maskedServiceKey = supabaseServiceKey !== 'Not set'
    ? `${supabaseServiceKey.substring(0, 5)}...${supabaseServiceKey.substring(supabaseServiceKey.length - 5)}`
    : 'Not set';
  
  // Return the masked environment variables
  return NextResponse.json({
    supabaseUrl: maskedUrl,
    supabaseAnonKey: maskedAnonKey,
    supabaseServiceKey: maskedServiceKey,
    nodeEnv: process.env.NODE_ENV || 'Not set'
  });
}