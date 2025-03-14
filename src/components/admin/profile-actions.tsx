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
  
  // Add more detailed debugging
  console.log(`View button will link to: ${profileExists && profileId ? `/admin/participants/${profileId}` : `/admin/applications/${applicationId}`}`);
  
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
      <Link
        href={`/admin/participants/${profileId || applicationId}`}
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