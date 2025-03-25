import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  // Create a response object and Supabase client
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // DEVELOPMENT MODE: Add mock authentication for admin routes and their API calls
  if (process.env.NODE_ENV === 'development') {
    // Check if this is an admin route or an admin API route
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isAdminApiRoute = request.nextUrl.pathname.startsWith('/api/admin');
    
    if (isAdminRoute || isAdminApiRoute) {
      console.log(`🔐 DEV AUTH: Authentication bypass for route: ${request.nextUrl.pathname}`);
      
      // For API routes in development, we need to ensure cookies are properly set
      // This helps prevent AuthSessionMissingError
      if (isAdminApiRoute) {
        console.log('Setting development mode auth cookies for API route');
        
        // We still need to get the session to ensure cookies are properly set
        await supabase.auth.getSession();
      }
      
      return res;
    }
  }

  // Skip further middleware processing for non-admin API routes
  if (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/admin')) {
    return NextResponse.next();
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  const protectedPaths = ['/admin', '/participant'];
  
  // Login pages should be excluded from protection
  const loginPaths = ['/admin/login', '/participant/login'];
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
        return NextResponse.redirect(new URL('/admin/login', request.url));
      } else {
        return NextResponse.redirect(new URL('/participant/login', request.url));
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
        // Redirect non-admin users to participant dashboard
        return NextResponse.redirect(new URL('/participant', request.url));
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
          
        const participantData = husbandData || wifeData;
        
        // If neither an admin nor a participant, redirect to login
        if (!participantData) {
          return NextResponse.redirect(new URL('/participant/login', request.url));
        }
        
        // Check if access has expired
        if (participantData.access_expires_at) {
          const expirationDate = new Date(participantData.access_expires_at);
          const today = new Date();
          
          // Set both dates to midnight for accurate comparison
          expirationDate.setHours(23, 59, 59, 999);
          today.setHours(0, 0, 0, 0);
          
          if (today > expirationDate) {
            // Sign out the user if access has expired
            await supabase.auth.signOut();
            return NextResponse.redirect(new URL('/access-expired', request.url));
          }
        }
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/participant/:path*',
    '/api/admin/:path*',
  ],
};