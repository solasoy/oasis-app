'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ApplicationActionsProps {
  applicationId: string;
  status: string;
  profileCreated?: boolean;
}

export function ApplicationActionsFixed({ 
  applicationId, 
  status, 
  profileCreated = false 
}: ApplicationActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDevelopment, setIsDevelopment] = useState(false);

  // Check if we're in development mode
  useEffect(() => {
    // In client components, we can't directly access process.env.NODE_ENV
    // So we'll check for development-specific features or use a public env var
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    setIsDevelopment(isLocalhost);
    console.log('Development mode detection:', { isLocalhost });
  }, []);

  const handleUpdateStatus = async (newStatus: 'approved' | 'rejected') => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Updating application status:', {
        applicationId,
        newStatus,
        profileCreated,
        isDevelopment
      });

      // Use the correct development API endpoint
      const apiEndpoint = isDevelopment 
        ? '/api/admin/update-application-status-dev' 
        : '/api/admin/update-application-status';

      console.log('Using API endpoint:', apiEndpoint);

      // Call the API endpoint
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
          profileCreated,
        }),
      });

      // Log the raw response for debugging
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Try to parse the response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        throw new Error(`Failed to parse response: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update application status');
      }

      // Show success message
      setSuccess(`Application ${newStatus} successfully`);
      
      // Refresh the page to show the updated status
      router.refresh();
      
      // Force a reload after a short delay to ensure the updated data is fetched
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error('Error updating application status:', err);
      setError(err.message || 'Failed to update application status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mt-6">
      {isDevelopment && (
        <div className="mb-4 bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <p className="text-sm text-yellow-700">
            Development Mode: Using development API endpoint
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {status === 'pending' && (
        <div className="flex space-x-4">
          <button
            onClick={() => handleUpdateStatus('approved')}
            disabled={isUpdating}
            className={`text-green-600 hover:text-green-900 px-3 py-2 rounded border border-green-600 hover:bg-green-50 ${
              isUpdating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUpdating ? 'Updating...' : 'Approve Application'}
          </button>
          <button
            onClick={() => handleUpdateStatus('rejected')}
            disabled={isUpdating}
            className={`text-red-600 hover:text-red-900 px-3 py-2 rounded border border-red-600 hover:bg-red-50 ${
              isUpdating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUpdating ? 'Updating...' : 'Reject Application'}
          </button>
        </div>
      )}
      
      {status === 'approved' && (
        profileCreated ? (
          <div className="text-green-600 font-medium px-3 py-2 rounded bg-green-50 border border-green-200 inline-block">
            Profile Created
          </div>
        ) : (
          <Link
            href={`/admin/create-profile?application=${applicationId}&edit=true`}
            className="text-blue-600 hover:text-blue-900 px-3 py-2 rounded border border-blue-600 hover:bg-blue-50 inline-block"
          >
            Edit Profile
          </Link>
        )
      )}
    </div>
  );
}