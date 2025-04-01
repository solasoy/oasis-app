import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session if expired
  await supabase.auth.getSession();

  // Public paths that don't require auth
  const publicPaths = ['/participant/login', '/admin/login', '/access-expired'];
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return res;
  }

  // Get session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Skip session check for admin routes in development mode
  if (process.env.NODE_ENV === 'development' && request.nextUrl.pathname.startsWith('/admin')) {
    return res;
  }
  
  if (!session) {
    const redirectUrl = request.nextUrl.pathname.startsWith('/admin')
      ? '/admin/login'
      : '/participant/login';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // For admin routes, verify admin access
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip admin checks in development mode
    if (process.env.NODE_ENV === 'development') {
      return res;
    }

    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (!adminData) {
      return NextResponse.redirect(new URL('/participant', request.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/participant/:path*'
  ]
}