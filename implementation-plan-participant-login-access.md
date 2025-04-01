# Participant Login Access Implementation Plan

## Objective
Implement an explicit workflow for creating Supabase Auth accounts for participants with a clear, intuitive user interface.

## Workflow
1. Application is approved
2. Participant profile is created
3. Temporary passwords are generated
4. Admin can explicitly grant login access via "Set Login Access" button

## Frontend Changes
### Intake Page (`/admin/intake`)
- Add action buttons for each participant:
  * View
  * Edit
  * Delete
  * Set Login Access
  * Send Welcome Email

### Action Button Component
- Create `ParticipantActionButtons` component
- Implement state management for button interactions
- Handle different states:
  * Profile not created
  * Profile created, no login access
  * Login access granted

## Backend Changes
### New API Endpoint
- `/api/participants/set-login-access`
  * Validates participant profile exists
  * Checks temporary passwords are set
  * Creates Supabase Auth accounts
  * Updates participant record

## Error Handling
- Validate all preconditions before creating accounts
- Provide clear, user-friendly error messages
- Log detailed error information for debugging

## Security Considerations
- Use service role for account creation
- Validate admin permissions
- Implement rate limiting
- Log all access attempts

## Future Improvements
- Add multi-factor authentication option
- Implement more granular access controls
- Create comprehensive audit logging

## Technical Implementation Details

### Frontend Component Pseudocode
```typescript
function ParticipantActionButtons({ participant }) {
  const canSetLoginAccess = 
    participant.profile_created && 
    participant.husband_temp_password && 
    participant.wife_temp_password &&
    !participant.husband_auth_id &&
    !participant.wife_auth_id;

  const handleSetLoginAccess = async () => {
    try {
      const response = await fetch('/api/participants/set-login-access', {
        method: 'POST',
        body: JSON.stringify({ participantId: participant.id })
      });
      
      if (response.ok) {
        // Update UI, show success message
      } else {
        // Show error message
      }
    } catch (error) {
      // Handle network or unexpected errors
    }
  };

  return (
    <div>
      <button onClick={handleSetLoginAccess} disabled={!canSetLoginAccess}>
        Set Login Access
      </button>
    </div>
  );
}
```

### Backend API Handler Pseudocode
```typescript
async function setLoginAccess(participantId) {
  // 1. Validate participant exists
  // 2. Check temporary passwords exist
  // 3. Verify no auth accounts exist
  // 4. Create Supabase Auth accounts
  // 5. Update participant record
  // 6. Return success or detailed error
}
```

## Testing Strategy
- Unit tests for frontend component
- Integration tests for API endpoint
- Edge case testing:
  * Duplicate account creation attempts
  * Missing or invalid participant data
  * Permission and authorization checks