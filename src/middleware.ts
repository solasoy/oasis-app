import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  const protectedPaths = ['/admin', '/dashboard'];
  const isProtectedPath = protectedPaths.some((path) => 
    req.nextUrl.pathname.startsWith(path)
  );

  // Admin-only routes
  const isAdminPath = req.nextUrl.pathname.startsWith('/admin');
  
  if (isProtectedPath) {
    if (!session) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (isAdminPath) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Check if user has admin role (you'll need to set up this column in your users table)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      if (profile?.role !== 'admin') {
        // Redirect non-admin users to dashboard
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
  ],
};