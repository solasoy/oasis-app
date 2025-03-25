# Middleware Architecture

This document explains the middleware architecture used in the Oasis Retreat application.

## Overview

The application uses multiple middleware files to handle different routes:

1. **middleware_admin_login.ts** - Handles admin routes
2. **middleware_participant_login.ts** - Handles participant routes
3. **middleware_dashboard.ts** - Handles dashboard routes
4. **middleware_root.ts** - Handles root and public routes

Each middleware file is responsible for a specific set of routes, as defined by its matcher configuration.

## Middleware Files

### middleware_admin_login.ts

This middleware handles all routes that start with `/admin` except for `/admin/login`. It:
- Redirects unauthenticated users to the admin login page
- Checks if the user is an admin and redirects non-admin users to the participant dashboard

```javascript
export const config = {
  matcher: [
    '/admin/:path*',
    '!/admin/login',
  ],
};
```

### middleware_participant_login.ts

This middleware handles all routes that start with `/participant` except for `/participant/login`. It:
- Redirects unauthenticated users to the participant login page
- Checks if the user is an admin or participant and redirects unauthorized users to the participant login page
- Checks if the participant's access has expired and redirects to the access-expired page if needed

```javascript
export const config = {
  matcher: [
    '/participant/:path*',
    '!/participant/login',
  ],
};
```

### middleware_dashboard.ts

This middleware handles all routes that start with `/dashboard`. It:
- Redirects unauthenticated users to the participant login page
- Checks if the user is an admin or participant and redirects unauthorized users to the participant login page
- Checks if the participant's access has expired and redirects to the access-expired page if needed

```javascript
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
```

### middleware_root.ts

This middleware handles all other routes that are not handled by the other middleware files. It:
- Allows access to all public routes without authentication
- Doesn't perform any redirects

```javascript
export const config = {
  matcher: [
    '/((?!admin|participant|dashboard|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## Authentication Flow

1. When a user visits a protected route, the middleware checks if they are authenticated
2. If not authenticated, they are redirected to the appropriate login page
3. After logging in, the middleware checks if they have the appropriate role (admin or participant)
4. If they don't have the appropriate role, they are redirected to the appropriate dashboard

## Troubleshooting

### Admin Login Issues

If you're having issues with the admin login page:

1. Clear all cookies and sign out of Supabase Auth:
   - Run the script in `src/scripts/clear-supabase-session.js` in the browser console
   - This will sign you out of Supabase Auth and clear all cookies

2. Test the admin login page:
   - Run the script in `src/scripts/test-admin-login-access.js` in the browser console
   - This will test if the admin login page is accessible and not being redirected

3. Check the server logs:
   - Look for log messages from the middleware files
   - Check which middleware is processing the request
   - Check for any error messages

### Rate Limit Issues

If you're seeing "Request rate limit reached" errors:

1. Wait a few minutes before trying again
2. Clear all cookies and sign out of Supabase Auth
3. Use the simplified login form that makes fewer Supabase requests

### Auth Bypass Cookies

The application uses auth bypass cookies as a temporary solution until Supabase Auth is fully working. These cookies can cause issues if they're set incorrectly.

To clear the auth bypass cookies:
- Run the script in `src/scripts/clear-auth-bypass-cookies.js` in the browser console
- This will clear the auth bypass cookies and reload the page

## Middleware Execution Order

Next.js executes middleware files in the order they're defined in the matcher configuration. If multiple middleware files match the same route, the one with the most specific matcher will be executed.

For example, if a route matches both the admin middleware and the root middleware, the admin middleware will be executed because it has a more specific matcher.

## Debugging Middleware

To debug middleware issues:
1. Add console.log statements to the middleware files
2. Check the server logs for these messages
3. Use the browser's developer tools to check the network requests and responses
4. Use the browser's developer tools to check the cookies
5. Use the scripts in the `src/scripts` directory to test specific issues