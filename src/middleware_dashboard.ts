import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  // Authenticate request with flexible options
  const auth = await authenticateRequest(request, {
    redirectTo: '/participant/login'
  });
  
  // If authentication returns a response (redirect or error), return it
  if (auth instanceof NextResponse) {
    return auth;
  }
  
  const { session, user } = auth;
  
  // Additional access checks if needed
  if (session && user) {
    // Optional: Add any specific dashboard access logic
    // For example, checking access expiration
    if (user.email) {
      // Ensure we have a Supabase client
      const supabase = auth.supabase || createMiddlewareClient({ req: request, res: NextResponse.next() });
      
      const { data: participantData } = await supabase
        .from('participants')
        .select('access_expires_at')
        .or(`husband_email.eq.${user.email},wife_email.eq.${user.email}`)
        .maybeSingle();
      
      if (participantData?.access_expires_at) {
        const expirationDate = new Date(participantData.access_expires_at);
        const today = new Date();
        
        if (today > expirationDate) {
          // Sign out and redirect if access has expired
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL('/access-expired', request.url));
        }
      }
    }
  }
  
  // Return the response from authentication
  return auth.res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};