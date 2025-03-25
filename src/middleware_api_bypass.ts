import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes in development mode
  if (process.env.NODE_ENV === 'development' && request.nextUrl.pathname.startsWith('/api/')) {
    console.log(`🔐 DEV AUTH: Complete bypass of middleware for API route: ${request.nextUrl.pathname}`);
    return NextResponse.next();
  }

  // For all other routes, proceed with normal middleware processing
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};