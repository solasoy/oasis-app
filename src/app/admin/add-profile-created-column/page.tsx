'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/admin-layout';

export default function AddProfileCreatedColumnPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    sql?: string;
  } | null>(null);

  const handleAddColumn = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/add-profile-created-column', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
        });
      } else {
        setResult({
          success: false,
          error: data.error || 'Failed to add profile_created column',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Add profile_created Column to Applications Table</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600 mb-6">
            This page adds the profile_created column to the applications table. This column is used to track which applications have had participant profiles created.
          </p>
          
          <div className="mb-6">
            <button
              onClick={handleAddColumn}
              disabled={loading}
              className={`w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Adding Column...' : 'Add profile_created Column'}
            </button>
          </div>
          
          {result && (
            <div className="mt-6">
              {result.success ? (
                <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  <p className="font-bold">Success!</p>
                  <p>{result.message}</p>
                  <div className="mt-4">
                    <Link href="/admin/intake" className="text-blue-600 hover:underline">
                      Go to Intake Page
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <p className="font-bold">Error</p>
                  <p>{result.error}</p>
                  
                  {result.sql && (
                    <div className="mt-4">
                      <p className="font-semibold">Please run the following SQL in your Supabase SQL Editor:</p>
                      <div className="mt-2 bg-gray-800 text-white p-4 rounded overflow-auto text-sm">
                        <pre>{result.sql}</pre>
                      </div>
                      <p className="mt-2">
                        After running the SQL, click the button again to verify the column was added.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Important Notes</span>
              </div>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  This page should only be used during initial setup and should be removed in production.
                </li>
                <li>
                  This operation requires the SUPABASE_SERVICE_KEY environment variable to be set.
                </li>
                <li>
                  After adding the column, you can proceed with using the intake functionality.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}