import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Development bypass
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  const protectedPaths = ['/admin', '/dashboard'];
  
  // Login pages should be excluded from protection
  const loginPaths = ['/admin/login', '/dashboard/login'];
  const isLoginPath = loginPaths.some((path) =>
    request.nextUrl.pathname === path
  );
  
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  ) && !isLoginPath;

  // Admin-only routes
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  
  if (isProtectedPath) {
    if (!session) {
      // Redirect to the appropriate login page based on the route
      if (isAdminPath) {
        // Redirect to admin login if trying to access admin routes
        return NextResponse.redirect(new URL('/admin/login', request.url));
      } else {
        // Redirect to participant login if trying to access dashboard routes
        return NextResponse.redirect(new URL('/dashboard/login', request.url));
      }
    }

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isAdminPath) {
      // Check if user is in the admins table
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user?.email)
        .single();

      if (!adminData) {
        // Redirect non-admin users to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } else {
      // For dashboard routes, check if user is an admin first (admins can access participant routes)
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user?.email)
        .single();

      if (!adminData) {
        // If not an admin, check if user is a participant
        const { data: husbandData } = await supabase
          .from('participants')
          .select('*')
          .eq('husband_email', user?.email)
          .maybeSingle();
          
        const { data: wifeData } = await supabase
          .from('participants')
          .select('*')
          .eq('wife_email', user?.email)
          .maybeSingle();
          
        // If neither an admin nor a participant, redirect to login
        if (!husbandData && !wifeData) {
          return NextResponse.redirect(new URL('/dashboard/login', request.url));
        }
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