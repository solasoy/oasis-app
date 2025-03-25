# Admin Setup Instructions

This document provides instructions for setting up the admin table in Supabase and creating your first admin account.

## Understanding the Authentication System

The admin authentication system uses two components:

1. **Supabase Auth**: This is where user credentials (email and password) are stored. Passwords are securely hashed and managed by Supabase's built-in authentication system, not in our database tables.

2. **Admins Table**: This table only stores admin information (email, name, created_at) and is used to determine if a user has admin privileges. It does NOT store passwords.

When an admin logs in:
- The email and password are verified against Supabase Auth
- If valid, the system then checks if the email exists in the admins table
- If both checks pass, the user is granted admin access

## Step 1: Create the Admins Table in Supabase

1. Log in to your Supabase dashboard at https://app.supabase.io/
2. Select your project
3. Navigate to the "SQL Editor" section in the left sidebar
4. Click "New Query" to create a new SQL query
5. Copy and paste the SQL script from `src/scripts/create-admins-table.sql`
6. **Important**: Before running the script, replace `'your-email@example.com'` and `'Your Name'` with your actual email and name
7. Click "Run" to execute the query

## Step 2: Create a User Account in Supabase Auth

1. In your Supabase dashboard, navigate to "Authentication" > "Users"
2. Click "Add User" or "Invite User"
3. Enter the same email address you used in the SQL script
4. Set a password for your account (this is where your admin password is stored)
5. Create the user

## Step 3: Log in to the Admin Portal

1. Go to your application's admin login page at `/admin/login`
2. Enter the email and password you created in Step 2
3. Click "Sign in"

If everything is set up correctly, you should now be logged in to the admin portal with full admin privileges.

## Troubleshooting Login Errors

### "You do not have admin privileges" Error

If you see the error message "You do not have admin privileges" when trying to log in, it means:
1. Your authentication with Supabase Auth was successful (your email and password are correct)
2. But the system couldn't find your email in the admins table

### "Error checking admin status" Error

If you see the error message "Error checking admin status" when trying to log in, it means:
1. Your authentication with Supabase Auth was successful
2. But there was an error when querying the admins table

This could be due to:
- The admins table doesn't exist
- There's a permission issue with the Supabase client
- There's a compatibility issue with the Supabase version

### Auth Bypass Cookies Issue

If you see log messages about "Auth bypass for: [email]" for an email that's not yours, it means:
1. There are auth bypass cookies set in your browser
2. These cookies are being used by the middleware to authenticate you as another user

To clear these cookies:
1. Open your browser's developer console (F12 or right-click > Inspect)
2. Go to the Console tab
3. Copy and paste the following code:
```javascript
// Clear the auth_bypass cookie
document.cookie = 'auth_bypass=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

// Clear the auth_email cookie
document.cookie = 'auth_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

console.log('Auth bypass cookies cleared');

// Reload the page
window.location.reload();
```
4. Press Enter to execute the code
5. The page will reload and the auth bypass cookies will be cleared

Alternatively, you can run the script provided in `src/scripts/clear-auth-bypass-cookies.js` in your browser console.

### Recent Fixes for Email Matching Issues

We've recently improved the admin login system to handle:
- Case sensitivity: The system now performs case-insensitive matching for email addresses
- Whitespace: The system now trims any leading or trailing whitespace from email addresses
- Multiple checks: The system now tries both exact matching and manual filtering to find your admin record
- Compatibility: The system now uses more compatible methods to query the admins table

These improvements should resolve most login issues. If you're still experiencing problems, follow the troubleshooting steps below.

### Troubleshooting Steps

1. Run the troubleshooting script in the Supabase SQL Editor:
   - Go to the SQL Editor in your Supabase dashboard
   - Create a new query
   - Copy and paste the SQL script from `src/scripts/troubleshoot-admin-login.sql`
   - **Important**: Replace `'solasoy2000@yahoo.com'` with your actual email address
   - Run the script to check if your email is properly registered in the admins table

2. If the troubleshooting script shows that your email is in the admins table but you're still having issues, run the fix script:
   - Go to the SQL Editor in your Supabase dashboard
   - Create a new query
   - Copy and paste the SQL script from `src/scripts/fix-admin-email.sql`
   - **Important**: Replace `'solasoy2000@yahoo.com'` with your actual email address
   - Run the script to fix common issues with email addresses in the admins table

3. Common issues and solutions:
   - **Admins table doesn't exist**: Run the `create-admins-table.sql` script
   - **Email not found in admins table**: Uncomment and modify the INSERT statement in the troubleshooting script to add your email
   - **Case sensitivity issue**: The fix script will convert all emails to lowercase
   - **Whitespace issue**: The fix script will trim whitespace from all emails
   - **Email mismatch**: Make sure the email in the admins table exactly matches the email in your Supabase Auth account
   - **Auth bypass cookies**: Clear the auth bypass cookies using the script provided

4. After making changes, try logging in again

## General Troubleshooting

If you encounter other issues:

1. Verify that the admins table was created successfully:
   ```sql
   SELECT * FROM admins;
   ```

2. Verify that your email is in the admins table:
   ```sql
   SELECT * FROM admins WHERE email = 'your-email@example.com';
   ```

3. Verify that your user account exists in Supabase Auth:
   - Go to Authentication > Users in the Supabase dashboard
   - Check that your email is listed

4. Check that the email in the admins table exactly matches the email in your Supabase Auth account

5. If you forget your password:
   - You can reset it through the Supabase dashboard
   - Go to Authentication > Users
   - Find your user
   - Click on the three dots menu and select "Reset password"

## Adding More Admin Users

Once you're logged in as an admin, you can add more admin users through the Admin Support page at `/admin/support`.

**Important**: When adding a new admin through the Support page, you're only adding their email to the admins table. They still need to have a user account in Supabase Auth with the same email address to be able to log in.