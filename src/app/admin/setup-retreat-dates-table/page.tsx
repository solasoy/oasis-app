'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';

export default function SetupRetreatDatesTablePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetupTable = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/setup-retreat-dates-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup retreat dates table');
      }

      setResult(data);
    } catch (err: any) {
      console.error('Error setting up retreat dates table:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Setup Retreat Dates Table</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <p className="mb-4 text-gray-600">
            This page will create the retreat_dates table in your database and seed it with the current retreat date (March 5-9, 2025).
            This is a one-time setup operation.
          </p>
          
          <div className="mb-6">
            <button
              onClick={handleSetupTable}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Setting up...' : 'Setup Retreat Dates Table'}
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {result && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
              <p className="font-bold">Success</p>
              <p>{result.message}</p>
              <p>Status: {result.status}</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}