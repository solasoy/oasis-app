import { NextResponse } from 'next/server';

export async function GET() {
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Mask keys for security
  const maskKey = (key: string | undefined) => {
    if (!key) return 'Not set';
    if (key.length <= 8) return '********';
    return key.substring(0, 4) + '****' + key.substring(key.length - 4);
  };
  
  return NextResponse.json({
    supabaseUrl: supabaseUrl || 'Not set',
    supabaseAnonKey: maskKey(supabaseAnonKey),
    supabaseServiceRoleKey: maskKey(supabaseServiceRoleKey),
    nodeEnv: process.env.NODE_ENV || 'Not set'
  });
}