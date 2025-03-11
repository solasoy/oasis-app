# Authentication Redesign Implementation Plan

This document outlines the detailed implementation plan for redesigning the authentication system with separate routes for admin and participant users.

## Overview

```mermaid
flowchart TD
    A[Start] --> B[Create Participants Table]
    B --> C[Create Admin Login Page]
    B --> D[Create Participant Login Page]
    C --> E[Remove Existing Login Page]
    D --> E
    E --> F[Update Middleware]
    F --> G[Update Admin Layout]
    G --> H[Implement Create Profile Page]
    H --> I[Update Landing Page]
    I --> J[Test Authentication Flow]
```

## Current State

1. **Applications Table**: Stores application data submitted by users
2. **Admins Table**: Stores admin user information (email, name)
3. **Profiles Table**: Contains user roles (admin/participant) and is currently used for access control

## Target State

1. **Applications Table**: Remains unchanged, stores application data
2. **Admins Table**: Used for admin authentication
3. **Participants Table**: New table for approved applicants with payment information
4. **Separate Login Pages**: Dedicated login pages for admin and participant users

## Implementation Steps

### Step 1: Create Participants Table
Create a new 'participants' table in Supabase to store information about approved applicants:

```sql
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  retreat_date DATE NOT NULL,
  
  -- Husband information
  husband_first_name TEXT NOT NULL,
  husband_last_name TEXT NOT NULL,
  husband_email TEXT NOT NULL,
  
  -- Wife information
  wife_first_name TEXT NOT NULL,
  wife_last_name TEXT NOT NULL,
  wife_email TEXT NOT NULL,
  
  -- Payment information
  fee_amount DECIMAL(10, 2) NOT NULL,
  has_payment_plan BOOLEAN DEFAULT FALSE,
  
  -- Fixed payment plan details
  payment_plan_type TEXT CHECK (payment_plan_type IN ('fixed', 'variable') OR payment_plan_type IS NULL),
  payment_cadence TEXT CHECK (payment_cadence IN ('weekly', 'biweekly', 'monthly') OR payment_cadence IS NULL),
  
  -- Variable payment plan details
  number_of_payments INTEGER,
  variable_payments JSONB, -- Array of {amount, dueDate} objects
  
  UNIQUE(application_id)
);
```

### Step 2: Create Admin Login Page
Create a dedicated login page for admin users at `/admin/login` that:
- Checks if the user is already logged in
- Verifies if the user is in the admins table
- Redirects to the appropriate dashboard based on user type
- Provides a form for admin login

### Step 3: Create Participant Login Page
Create a dedicated login page for participants at `/dashboard/login` that:
- Checks if the user is already logged in
- Verifies if the user is in the participants table
- Redirects to the appropriate dashboard based on user type
- Provides a form for participant login

### Step 4: Update Middleware
Update the middleware to:
- Redirect unauthenticated users to the appropriate login page
- Check the admins table for admin route access
- Check the participants table for participant route access
- Allow admins to access participant routes
- Redirect unauthorized users appropriately

### Step 5: Update Admin Layout
Update the admin layout to:
- Check if the user is in the admins table
- Redirect non-admin users to the dashboard

### Step 6: Implement Create Profile Page
Create a page for admins to create participant profiles for approved applications:

```mermaid
flowchart TD
    A[Admin Approves Application] --> B[Click Create Profile]
    B --> C[Pre-filled Form with Application Data]
    C --> D[Add Payment Information]
    D --> E{Payment Plan?}
    E -->|No| G[Set Single Payment]
    E -->|Yes| F{Plan Type}
    F -->|Fixed| H[Set Cadence]
    F -->|Variable| I[Set Multiple Payments]
    H --> J[Calculate Payment Amounts]
    I --> K[Enter Individual Payments]
    G --> L[Save Profile]
    J --> L
    K --> L
    L --> M[Create User Accounts]
    M --> N[Send Welcome Emails]
```

The create profile form will include:
- Date (auto-filled with current date)
- Retreat Date (from application)
- Husband's information (from application)
  - First Name
  - Last Name
  - Email
- Wife's information (from application)
  - First Name
  - Last Name
  - Email
- Fee Amount ($)
- Payment Plan (Yes/No)
- If Payment Plan = Yes:
  - Plan Type (Fixed/Variable)
  - If Fixed:
    - Cadence (Weekly/Biweekly/Monthly)
    - Auto-calculated payment amounts
  - If Variable:
    - Number of payments
    - Amount for each payment

### Step 7: Update Landing Page
Update the landing page to include links to both login pages:
- Admin Login
- Participant Login

### Step 8: Remove Existing Login Page
Remove the existing login page at `/login` and update any references to it.

## Implementation Strategy

1. **Database Changes First**: Create the 'participants' table in Supabase
2. **Authentication Flow Next**: Implement the login pages and update the middleware
3. **UI Components Last**: Create the profile creation page and update the landing page

This approach ensures that the core authentication infrastructure is in place before updating the UI components.

## Testing Plan

1. **Database Testing**:
   - Verify the 'participants' table is created correctly
   - Test inserting and querying participant records

2. **Authentication Testing**:
   - Test admin login with valid admin credentials
   - Test admin login with non-admin credentials (should fail)
   - Test participant login with valid participant credentials
   - Test participant login with non-participant credentials (should fail)

3. **Middleware Testing**:
   - Test accessing admin routes as an admin (should succeed)
   - Test accessing admin routes as a participant (should redirect)
   - Test accessing participant routes as a participant (should succeed)
   - Test accessing participant routes as an admin (should succeed)
   - Test accessing protected routes without authentication (should redirect to login)

4. **UI Testing**:
   - Verify the admin login page displays correctly
   - Verify the participant login page displays correctly
   - Test the create profile functionality with various payment scenarios
   - Verify the landing page links work correctly