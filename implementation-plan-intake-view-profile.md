# Implementation Plan: Intake Page View Profile Button

## Current Issue
On the Intake page, the "View" button currently links to the application form (`/admin/applications/[id]`). The user wants the "View" button to show the participant profile instead of the application form.

## Solution Overview
1. Create a new page at `/admin/participants/[id]/page.tsx` to display participant profiles
2. Modify the `ProfileActions` component to link to this new page when used in the Intake context

## Implementation Details

### 1. Create Participant Profile View Page

Create a new file at `src/app/admin/participants/[id]/page.tsx`:

```tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';

export default async function ParticipantProfilePage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch participant profile with associated application
  const { data: participant, error } = await supabase
    .from('participants')
    .select(`
      *,
      applications(*)
    `)
    .eq('id', params.id)
    .single();
  
  if (error || !participant) {
    console.error('Error fetching participant profile:', error);
    notFound();
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Participant Profile</h1>
          <Link href="/admin/intake" className="text-blue-600 hover:underline">
            Back to Intake
          </Link>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {participant.husband_first_name} {participant.husband_last_name} & {participant.wife_first_name} {participant.wife_last_name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Created on {new Date(participant.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Retreat Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {participant.retreat_date}
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Husband Information</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <p>Name: {participant.husband_first_name} {participant.husband_last_name}</p>
                  <p>Email: {participant.husband_email}</p>
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Wife Information</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <p>Name: {participant.wife_first_name} {participant.wife_last_name}</p>
                  <p>Email: {participant.wife_email}</p>
                </dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Payment Information</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <p>Fee Amount: ${participant.fee_amount}</p>
                  <p>Payment Plan: {participant.has_payment_plan ? 'Yes' : 'No'}</p>
                  
                  {participant.has_payment_plan && (
                    <>
                      <p>Plan Type: {participant.payment_plan_type === 'fixed' ? 'Fixed (Equal Payments)' : 'Variable (Custom Payments)'}</p>
                      
                      {participant.payment_plan_type === 'fixed' && (
                        <>
                          <p>Payment Cadence: {participant.payment_cadence}</p>
                          <p>Number of Payments: {participant.number_of_payments}</p>
                          <p>Payment Amount: ${(participant.fee_amount / participant.number_of_payments).toFixed(2)}</p>
                        </>
                      )}
                      
                      {participant.payment_plan_type === 'variable' && participant.variable_payments && (
                        <div className="mt-2">
                          <p className="font-medium">Payment Schedule:</p>
                          <table className="min-w-full divide-y divide-gray-200 mt-2">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {participant.variable_payments.map((payment: any, index: number) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payment.amount}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.dueDate).toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Actions</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex space-x-3">
                    <Link
                      href={`/admin/create-profile?application=${participant.application_id}&edit=true`}
                      className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-600 hover:bg-blue-50"
                    >
                      Edit Profile
                    </Link>
                    <Link
                      href={`/admin/applications/${participant.application_id}`}
                      className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-600 hover:bg-blue-50"
                    >
                      View Application
                    </Link>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
```

### 2. Modify ProfileActions Component

Update the `src/components/admin/profile-actions.tsx` file to change the "View" button link:

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProfileActionsProps {
  applicationId: string;
  profileId?: string;
  profileCreated: boolean;
}

export function ProfileActions({ applicationId, profileId, profileCreated }: ProfileActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Determine if a profile exists based on both the profileId and profileCreated flag
  const profileExists = profileCreated || !!profileId;
  
  // Log the props to help with debugging
  console.log(`ProfileActions for app ${applicationId}:`, { profileId, profileCreated, profileExists });
  
  const handleDeleteProfile = async () => {
    if (!confirm('Are you sure you want to delete this profile and reset the application status to pending?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/admin/delete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId, profileId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete profile');
      }
      
      // Show success message
      alert('Profile deleted successfully. The application status has been reset to pending.');
      
      // Force a complete page reload with cache busting
      const timestamp = new Date().getTime();
      window.location.href = `/admin/applications?t=${timestamp}`;
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="flex items-center space-x-3">
      {/* Change the View button link to point to the participant profile page if a profile exists */}
      <Link
        href={profileExists && profileId ? `/admin/participants/${profileId}` : `/admin/applications/${applicationId}`}
        className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-600 hover:bg-blue-50"
      >
        View
      </Link>
      
      {profileExists ? (
        <>
          <Link
            href={`/admin/create-profile?application=${applicationId}&edit=true`}
            className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-600 hover:bg-blue-50"
          >
            Edit
          </Link>
          <button
            onClick={handleDeleteProfile}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-900 px-2 py-1 rounded border border-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <span className="text-green-600 font-medium px-2 py-1 rounded bg-green-50 border border-green-200">
            Profile Created
          </span>
        </>
      ) : (
        <>
          <Link
            href={`/admin/create-profile?application=${applicationId}&edit=true`}
            className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-600 hover:bg-blue-50"
          >
            Edit
          </Link>
        </>
      )}
    </div>
  );
}
```

## Testing Plan
1. Navigate to the Intake page
2. For an approved application with a created profile, click the "View" button
3. Verify that it takes you to the participant profile page instead of the application page
4. Check that all participant information is displayed correctly
5. Test the "Edit Profile" and "View Application" links on the participant profile page

## Implementation Steps
1. Switch to Code mode
2. Create the participant profile view page
3. Modify the ProfileActions component
4. Test the changes