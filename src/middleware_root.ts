import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('Root Middleware processing request for:', request.nextUrl.pathname);
  
  // This middleware only handles the root path and public routes
  // It doesn't perform any authentication checks
  
  // For all paths, just proceed without redirects
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match root path and public routes, but exclude admin, participant, and dashboard routes
    // which are handled by their respective middleware files
    '/((?!admin|participant|dashboard|_next/static|_next/image|favicon.ico).*)',
  ],
};