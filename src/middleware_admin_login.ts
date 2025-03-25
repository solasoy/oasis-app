import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Log which middleware is processing the request
  console.log('Admin Middleware processing request for:', request.nextUrl.pathname);
  
  // Development bypass - Always allow access in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode detected, bypassing authentication');
    return NextResponse.next();
  }
  
  // Login pages should be excluded from protection
  const isLoginPath = request.nextUrl.pathname === '/admin/login';
  
  // If this is the login page, just proceed without authentication checks
  if (isLoginPath) {
    console.log('Accessing admin login page, skipping authentication checks');
    return NextResponse.next();
  }
  
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Check for auth bypass cookies (temporary solution until Supabase Auth is fully working)
  const authBypass = request.cookies.get('auth_bypass');
  const authEmail = request.cookies.get('auth_email');
  let bypassAuth = false;
  let bypassEmail = '';
  
  if (authBypass && authBypass.value === 'true' && authEmail) {
    console.log(`Auth bypass for: ${authEmail.value}`);
    bypassAuth = true;
    bypassEmail = authEmail.value.trim().toLowerCase();
  } else {
    console.log('No auth bypass cookies found');
  }

  // Get Supabase session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  console.log('Session exists:', !!session);
  
  // Allow access if we have a valid session or auth bypass
  if (!session && !bypassAuth) {
    console.log('No valid authentication, redirecting to login');
    
    // Redirect to admin login
    console.log('Redirecting to admin login');
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  console.log('Authentication valid, proceeding with access check');

  // Get the current user from session or bypass
  let userEmail = '';
  
  if (session) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ? user.email.trim().toLowerCase() : '';
  } else if (bypassAuth) {
    userEmail = bypassEmail;
  }
  
  if (!userEmail) {
    console.error('No user email found');
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  let isAdmin = false;

  // First try with exact match
  try {
    const { data: exactAdminData } = await supabase
      .from('admins')
      .select('*')
      .eq('email', userEmail)
      .single();
      
    if (exactAdminData) {
      console.log('Admin access granted with exact match for:', userEmail);
      isAdmin = true;
    }
  } catch (exactMatchError) {
    console.log('Exact match failed, trying alternative methods');
  }
  
  // If exact match fails, try getting all admins and filtering manually
  if (!isAdmin) {
    try {
      const { data: allAdmins } = await supabase
        .from('admins')
        .select('*');
        
      if (allAdmins && allAdmins.length > 0) {
        // Find admin with case-insensitive match
        const adminMatch = allAdmins.find(admin => 
          admin.email.toLowerCase().trim() === userEmail
        );
        
        if (adminMatch) {
          console.log('Admin access granted with case-insensitive match for:', userEmail);
          isAdmin = true;
        }
      }
    } catch (allAdminsError) {
      console.error('Error fetching all admins:', allAdminsError);
    }
  }

  if (!isAdmin) {
    console.log('User is not an admin, redirecting to participant dashboard');
    // Redirect non-admin users to participant dashboard
    return NextResponse.redirect(new URL('/participant', request.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '!/admin/login',
  ],
};