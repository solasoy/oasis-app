import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { getCachedAuth, setCachedAuth, clearCachedAuth } from './auth-cache';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

// Enhanced logging configuration
const LOGGING_ENABLED = process.env.NODE_ENV !== 'production';

// Detailed logging function
function logAuthEvent(level: 'info' | 'warn' | 'error', message: string, context?: Record<string, any>) {
  if (!LOGGING_ENABLED) return;

  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...context
  };

  switch (level) {
    case 'error':
      console.error(JSON.stringify(logEntry));
      break;
    case 'warn':
      console.warn(JSON.stringify(logEntry));
      break;
    default:
      console.log(JSON.stringify(logEntry));
  }
}

// Retry function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>, 
  maxRetries = 3, 
  baseDelay = 1000
): Promise<T> {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.status === 429) {
        // Rate limit error, wait with exponential backoff
        const waitTime = Math.pow(2, retries) * baseDelay;
        logAuthEvent('warn', `Rate limited, retrying in ${waitTime}ms`, { retries });
        await new Promise(resolve => setTimeout(resolve, waitTime));
        retries++;
      } else {
        // Other error, don't retry
        throw error;
      }
    }
  }
  
  // If we've exhausted retries, make one final attempt
  return await fn();
}

export async function authenticateRequest(
  request: NextRequest,
  options: {
    redirectTo?: string;
    adminOnly?: boolean;
    participantOnly?: boolean;
  } = {}
) {
  const userEmail = request.cookies.get('user_email')?.value;
  
  // Check cache first if email is available
  if (userEmail) {
    const cachedAuth = getCachedAuth(userEmail, options.adminOnly ? 'admin' : 'participant');
    if (cachedAuth) {
      logAuthEvent('info', 'Using cached authentication', { 
        email: userEmail, 
        context: options.adminOnly ? 'admin' : 'participant' 
      });
      
      // If cache specifies admin/participant requirements, validate
      if (options.adminOnly && !cachedAuth.adminStatus) {
        return NextResponse.redirect(new URL('/participant', request.url));
      }
      
      return { 
        res: NextResponse.next(), 
        session: cachedAuth.session, 
        user: cachedAuth.user 
      };
    }
  }

  const res = NextResponse.next();
  
  // Create Supabase clients
  const middlewareSupabase = createMiddlewareClient({ req: request, res });
  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Retrieve session with retry logic
    const { data: sessionData, error: sessionError } = await retryWithBackoff(() => 
      middlewareSupabase.auth.getSession()
    );
    
    if (sessionError) {
      logAuthEvent('error', 'Session retrieval failed', {
        error: sessionError,
        path: request.nextUrl.pathname
      });
      throw sessionError;
    }

    const session = sessionData.session;

    // Handle unauthenticated requests
    if (!session && options.redirectTo) {
      logAuthEvent('warn', 'Unauthenticated access attempt', {
        path: request.nextUrl.pathname,
        redirectTo: options.redirectTo
      });
      return NextResponse.redirect(new URL(options.redirectTo, request.url));
    }

    // User retrieval with service role
    let userData = null;
    let adminStatus = false;
    
    if (session) {
      const { data: { user }, error: userError } = await retryWithBackoff(() => 
        serviceSupabase.auth.getUser(session.access_token)
      );
      
      if (userError) {
        logAuthEvent('error', 'User retrieval failed', {
          error: userError,
          sessionExists: !!session
        });
        throw userError;
      }

      userData = user;

      // Admin-only route check
      if (options.adminOnly) {
        const adminResult = await retryWithBackoff(async () => {
          const response = await serviceSupabase
            .from('admins')
            .select('id')
            .eq('email', user?.email?.toLowerCase())
            .maybeSingle();
          
          return response as PostgrestSingleResponse<{ id: any } | null>;
        });
        
        if (adminResult.error) {
          logAuthEvent('error', 'Admin status check failed', { error: adminResult.error });
          throw adminResult.error;
        }
        
        adminStatus = !!adminResult.data;
        
        if (!adminStatus) {
          logAuthEvent('warn', 'Non-admin access attempt to admin route', {
            email: user?.email
          });
          return NextResponse.redirect(new URL('/participant', request.url));
        }
      }
      
      // Participant-only route check
      if (options.participantOnly) {
        const husbandResult = await retryWithBackoff(async () => {
          const response = await serviceSupabase
            .from('participants')
            .select('*')
            .eq('husband_email', user?.email?.toLowerCase())
            .maybeSingle();
          
          return response as PostgrestSingleResponse<any>;
        });
        
        const wifeResult = await retryWithBackoff(async () => {
          const response = await serviceSupabase
            .from('participants')
            .select('*')
            .eq('wife_email', user?.email?.toLowerCase())
            .maybeSingle();
          
          return response as PostgrestSingleResponse<any>;
        });
        
        if (husbandResult.error || wifeResult.error) {
          logAuthEvent('error', 'Participant status check failed', {
            husbandError: husbandResult.error,
            wifeError: wifeResult.error
          });
          throw husbandResult.error || wifeResult.error;
        }
        
        if (!husbandResult.data && !wifeResult.data) {
          logAuthEvent('warn', 'Non-participant access attempt', {
            email: user?.email
          });
          return NextResponse.redirect(new URL('/participant/login', request.url));
        }
      }

      // Cache the authentication result
      if (userData?.email) {
        setCachedAuth(userData.email, { 
          session, 
          user: userData, 
          adminStatus 
        }, options.adminOnly ? 'admin' : 'participant');
      }
    }
  
    // Force redirect to participant dashboard
    if (options.participantOnly && user) {
      console.error('FORCE REDIRECT TO PARTICIPANT DASHBOARD', {
        email: user.email
      });
      return NextResponse.redirect(new URL('/dashboard/participant', request.url));
    }
    
    logAuthEvent('info', 'Authentication successful', {
      path: request.nextUrl.pathname,
      userEmail: userData?.email
    });

    return { 
      res, 
      supabase: middlewareSupabase, 
      session, 
      user: userData 
    };

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unexpected authentication error';
    
    logAuthEvent('error', 'Authentication process failed', {
      error: err,
      path: request.nextUrl.pathname
    });

    // If a redirect is specified, use it; otherwise, return a generic error response
    return options.redirectTo 
      ? NextResponse.redirect(new URL(options.redirectTo, request.url))
      : new NextResponse(errorMessage, { status: 500 });
  }
}