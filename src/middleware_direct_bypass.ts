import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('Direct Bypass Middleware processing request for:', request.nextUrl.pathname);
  
  // Always allow access in development mode
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '!/admin/login', // Exclude login page to avoid redirect loops
  ],
};