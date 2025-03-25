# Manual Test Plan for Fixes

This document outlines the steps to verify the fixes for the three issues:

## Issue 1: Unable to delete profiles in the intake page

### Test Steps:
1. Log in as an admin user
2. Navigate to the admin intake page (`/admin/intake`)
3. Find a profile that has already been created
4. Click the "Delete" button for that profile
5. Confirm the deletion in the confirmation dialog

### Expected Result:
- The profile should be deleted successfully
- No "Error deleting user: User not allowed" message should appear
- The application should be reset to "pending" status
- The profile should no longer appear in the list of profiles with "Profile Created" status

## Issue 2: Unable to update an existing profile

### Test Steps:
1. Log in as an admin user
2. Navigate to the admin intake page (`/admin/intake`)
3. Find a profile that has already been created
4. Click the "Edit" button for that profile
5. Make changes to the profile (e.g., change the fee amount)
6. Click "Update Profile"

### Expected Result:
- The profile should be updated successfully
- No "A profile has already been created for this application" error should appear
- You should be redirected back to the intake page with a success message
- The changes should be reflected in the profile

## Issue 3: Error when sending welcome emails

### Test Steps:
1. Log in as an admin user
2. Navigate to the admin intake page (`/admin/intake`)
3. Find a profile that has already been created
4. Click the "Send Welcome Email" button for that profile

### Expected Result:
- In development/test mode:
  - The emails should be sent to the owner's email (solasoy2000@gmail.com) instead of the actual participant emails
  - The console should show logs indicating that the emails would have been sent to the actual participants
  - No Resend API validation errors should appear
- In production mode (with a verified domain):
  - The emails should be sent to the actual participant emails

## Additional Verification

To ensure all fixes are working together properly:

1. Create a new profile from an approved application
2. Edit the newly created profile
3. Send welcome emails to the profile
4. Delete the profile

All operations should complete successfully without errors.