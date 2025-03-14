# Implementation Plan: Change "Profile Creation Date" to "Date Submitted" in Intake Page

## Problem Statement
There is a persistent bug where the profile creation date column in the intake page table that contains approved applications is not displayed properly. The column currently shows "N/A (Participant data missing)" for applications.

## Solution Approach
Change the column from 'profile creation date' to 'date submitted', which mirrors a similar column in the application table. This approach uses the `submitted_at` field that is already available in the applications table and is guaranteed to exist for all applications.

## Implementation Steps

1. **Modify the Intake Page Table Header**:
   - Change the column header from "Profile Creation Date" to "Date Submitted" in `src/app/admin/intake/page.tsx`

2. **Update the Data Display Logic**:
   - Replace the complex logic that tries to access participant creation date
   - Use the `submitted_at` field directly from the application data
   - Format the date using `new Date(app.submitted_at).toLocaleDateString()`

## Code Changes Required

### File: `src/app/admin/intake/page.tsx`

1. Change the column header text:
```tsx
<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  Date Submitted
</th>
```

2. Replace the complex date display logic with:
```tsx
<div className="text-sm text-gray-500">
  {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'N/A'}
</div>
```

## Testing

After implementing these changes:
1. Navigate to the intake page
2. Verify that the column header now says "Date Submitted"
3. Verify that the column displays the submission date for all applications
4. Confirm that no "N/A (Participant data missing)" messages appear

## Benefits

1. **Simplicity**: Uses data that is guaranteed to exist for all applications
2. **Consistency**: Aligns with how dates are displayed in the applications page
3. **Reliability**: Eliminates the complex logic that's causing the current issue
4. **User Experience**: Provides a meaningful date that helps administrators understand when the application was submitted