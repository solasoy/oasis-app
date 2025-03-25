// This script adds console logs to help debug middleware execution order
// Add these console logs to the beginning of each middleware file

// For middleware.ts
console.log('==== MAIN MIDDLEWARE LOADED ====');
console.log('Matcher:', '/((?!admin|participant|_next/static|_next/image|favicon.ico).*)');

// For middleware_admin_login.ts
console.log('==== ADMIN MIDDLEWARE LOADED ====');
console.log('Matcher:', '/admin/:path*');

// For middleware_participant_login.ts
console.log('==== PARTICIPANT MIDDLEWARE LOADED ====');
console.log('Matcher:', '/participant/:path*');

// Then restart the server and check the console logs to see the order of middleware loading
// The middleware that loads last might override the others