# Implementation Plan: Participant Login Functionality

## Requirements

1. Create login credentials for participants (husband and wife) once their application is approved
2. Use email addresses for login and generate passwords for both husband and wife
3. Include login information in the welcome email
4. Set access to expire on the last day of the retreat
5. Provide admin access to participant views from the Intake page, bypassing participant login
6. Allow participants to reset their passwords

## Implementation Steps

### 1. Participant Account Creation

- [x] Create auth utility functions for generating passwords and creating participant accounts
- [x] Implement API endpoint for creating participant accounts when an application is approved
- [x] Update email templates to include login credentials in welcome email
- [x] Add expiration date to participant accounts based on retreat date

### 2. Participant Login Page

- [ ] Create participant login form component
- [ ] Implement login page for participants
- [ ] Add validation for participant credentials
- [ ] Handle authentication and session management for participants

### 3. Password Reset Functionality

- [ ] Create password reset request form
- [ ] Implement password reset API endpoint
- [ ] Create password reset confirmation page
- [ ] Add email notification for password reset requests

### 4. Access Expiration

- [ ] Implement access expiration check in middleware
- [ ] Create access expired page to display when access has expired
- [ ] Add automatic logout when access expires

### 5. Admin Access to Participant Views

- [ ] Create participant access button component for admin portal
- [ ] Implement API endpoint for admin to access participant views
- [ ] Add session management for admin accessing participant views
- [ ] Create UI indicator when admin is viewing participant pages

## Components to Implement

1. `ParticipantLoginForm`: Form for participants to log in
2. `ParticipantAccessButton`: Button for admins to access participant views
3. `PasswordResetForm`: Form for participants to reset their password
4. `AccessExpiredPage`: Page shown when participant access has expired

## API Endpoints to Implement

1. `/api/participants/create-accounts`: Create participant accounts when application is approved
2. `/api/auth/reset-password`: Handle password reset requests
3. `/api/admin/access-participant`: Allow admin to access participant views

## Database Schema Updates

1. Add `husband_auth_id` and `wife_auth_id` to participants table
2. Add `husband_temp_password` and `wife_temp_password` to participants table
3. Add `access_expires_at` to participants table

## Testing Strategy

1. Unit tests for auth utility functions
2. API tests for endpoints
3. Component tests for UI components
4. Integration tests for login flow
5. End-to-end tests for admin accessing participant views

## Security Considerations

1. Ensure passwords are securely generated and stored
2. Implement proper session management and authentication
3. Add rate limiting for login attempts
4. Validate all inputs on both client and server
5. Use HTTPS for all communications
6. Implement proper error handling without leaking sensitive information