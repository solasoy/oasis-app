# Participant Login Implementation Guide

This document provides instructions for implementing the participant login functionality for the Oasis Retreat application.

## Overview

The participant login functionality allows approved applicants (husband and wife) to access the participant dashboard using their email addresses and generated passwords. The access is time-limited and expires on the last day of the retreat. Admins can also access participant dashboards to track onboarding progress.

## Implementation Steps

### 1. Database Migration

First, run the database migration to add the necessary fields to the participants table:

```bash
# Install ts-node if not already installed
npm install --save-dev ts-node

# Run the migration
npm run migrate -- src/scripts/migrations/add-auth-fields-to-participants.sql
```

This will add the following fields to the participants table:
- `husband_auth_id` and `wife_auth_id`: Supabase Auth user IDs
- `husband_temp_password` and `wife_temp_password`: Temporary passwords
- `access_expires_at`: Date when access expires
- `husband_password_changed` and `wife_password_changed`: Track password changes

### 2. Account Creation Process

When an admin approves an application and creates a participant profile, they should also create login credentials for the participants. This can be done by calling the account creation API:

```typescript
// Example: Creating participant accounts after profile creation
const response = await fetch('/api/participants/create-accounts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ participantId: newParticipantId })
});

const data = await response.json();
if (data.success) {
  // Accounts created successfully
  console.log('Participant accounts created:', data.data);
} else {
  // Handle error
  console.error('Error creating participant accounts:', data.error);
}
```

### 3. Welcome Email with Credentials

When sending the welcome email to participants, include the login credentials:

```typescript
// Example: Sending welcome email with credentials
import { getParticipantWelcomeEmailTemplate } from '@/lib/email-templates';

// Get participant data with credentials
const { data: participant } = await supabase
  .from('participants')
  .select('*')
  .eq('id', participantId)
  .single();

// Send email with credentials
await resend.emails.send({
  from: 'Oasis Retreat <onboarding@resend.dev>',
  to: [participant.husband_email, participant.wife_email],
  subject: 'Welcome to Oasis Retreat - Your Login Information',
  html: getParticipantWelcomeEmailTemplate(participant)
});
```

### 4. Admin Access to Participant Dashboards

To allow admins to access participant dashboards, use the `ParticipantAccessButton` component:

```tsx
// Example: Using the ParticipantAccessButton in the admin interface
import { ParticipantAccessButton } from '@/components/admin/participant-access-button';

// In your component
<div className="mt-4 grid grid-cols-2 gap-4">
  <div>
    <h4 className="text-sm font-medium text-gray-500">Husband Access</h4>
    <ParticipantAccessButton
      participantId={participant.id}
      role="husband"
      label={`Access ${participant.husband_first_name}'s Dashboard`}
    />
  </div>
  
  <div>
    <h4 className="text-sm font-medium text-gray-500">Wife Access</h4>
    <ParticipantAccessButton
      participantId={participant.id}
      role="wife"
      label={`Access ${participant.wife_first_name}'s Dashboard`}
    />
  </div>
</div>
```

### 5. Password Reset Functionality

Participants can reset their passwords using the password reset functionality:

```tsx
// Example: Password reset form
const handleResetPassword = async (email: string) => {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  if (data.success) {
    // Show success message
  } else {
    // Handle error
  }
};
```

## Security Considerations

1. **Temporary Passwords**: The temporary passwords are stored in plain text in the database for inclusion in welcome emails. Participants should be encouraged to change their passwords after first login.

2. **Access Expiration**: Participant access expires on the last day of the retreat. This is enforced by the middleware.

3. **Admin Access**: When an admin accesses a participant's dashboard, a cookie is set to track this access. This allows the system to distinguish between admin access and participant access.

## Testing

1. **Account Creation**: Test creating participant accounts and verify that the accounts are created in Supabase Auth.

2. **Login**: Test logging in as a participant using the generated credentials.

3. **Access Expiration**: Test that access expires on the specified date by temporarily modifying the expiration date.

4. **Admin Access**: Test that admins can access participant dashboards and that the access is properly tracked.

5. **Password Reset**: Test the password reset functionality to ensure participants can reset their passwords.

## Troubleshooting

1. **Account Creation Fails**: Ensure that the Supabase service role key is properly configured and that the participant record exists.

2. **Login Fails**: Verify that the participant account was created successfully and that the correct credentials are being used.

3. **Admin Access Fails**: Ensure that the admin is properly authenticated and that the participant record exists.

4. **Password Reset Fails**: Check that the email address is associated with a participant account and that the Supabase configuration is correct.

## Future Improvements

1. **Password Strength Requirements**: Implement password strength requirements for participant passwords.

2. **Two-Factor Authentication**: Add support for two-factor authentication for additional security.

3. **Session Management**: Implement session management to allow participants to view and manage their active sessions.

4. **Access Logs**: Add logging for participant and admin access to track usage patterns and detect potential security issues.