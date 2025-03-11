'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SetupParticipantsTablePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    status?: string;
    sql?: string;
  } | null>(null);

  const handleCreateTable = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/setup-participants-table', {
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
          status: data.status,
          sql: data.sql
        });
      } else {
        setResult({
          success: false,
          error: data.error || 'Failed to create participants table',
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Setup Participants Table
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          This page creates the participants table for the Oasis Retreat application.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <button
                onClick={handleCreateTable}
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Checking Table...' : 'Check Participants Table'}
              </button>
            </div>
          </div>

          {result && (
            <div className="mt-6">
              {result.success ? (
                <div className={`${result.status === 'exists' ? 'bg-green-50 border border-green-400 text-green-700' : 'bg-yellow-50 border border-yellow-400 text-yellow-700'} px-4 py-3 rounded relative`}>
                  <p className="font-bold">{result.status === 'exists' ? 'Success!' : 'Action Required'}</p>
                  <p>{result.message}</p>
                  
                  {result.status === 'not_exists' && result.sql && (
                    <div className="mt-4">
                      <p className="font-semibold">Please run the following SQL in your Supabase SQL Editor:</p>
                      <div className="mt-2 bg-gray-800 text-white p-4 rounded overflow-auto text-sm">
                        <pre>{result.sql}</pre>
                      </div>
                      <p className="mt-2">
                        After running the SQL, click the button again to verify the table was created.
                      </p>
                    </div>
                  )}
                  
                  {result.status === 'exists' && (
                    <div className="mt-4">
                      <p>
                        You can now proceed to the next step of the implementation plan.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <p className="font-bold">Error</p>
                  <p>{result.error}</p>
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
                  After creating the participants table, you can proceed with the next steps of the authentication redesign.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}