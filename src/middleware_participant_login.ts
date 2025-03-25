import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';

export async function middleware(request: NextRequest) {
  // Skip authentication for login page
  const isLoginPath = request.nextUrl.pathname === '/participant/login';
  
  if (isLoginPath) {
    return NextResponse.next();
  }
  
  // Authenticate request with participant-only option
  const auth = await authenticateRequest(request, {
    redirectTo: '/participant/login',
    participantOnly: true
  });
  
  // If authentication returns a response (redirect or error), return it
  if (auth instanceof NextResponse) {
    return auth;
  }
  
  // Return the response from authentication
  return auth.res;
}

export const config = {
  matcher: [
    '/participant/:path*',
    '!/participant/login',
  ],
};