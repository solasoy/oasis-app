"use client";

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';

export default function AddWelcomeEmailColumnsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    details?: string;
  } | null>(null);

  const addColumns = async () => {
    try {
      setLoading(true);
      setResult(null);

      const response = await fetch('/api/admin/add-welcome-email-columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error adding welcome email columns:', error);
      setResult({
        success: false,
        error: 'Failed to add welcome email columns',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Add Welcome Email Columns</h1>

        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-700 mb-4">
            This page will add the necessary columns to the participants table to support welcome email functionality:
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-700">
            <li><code>welcome_email_sent</code> (boolean) - Tracks whether a welcome email has been sent</li>
            <li><code>welcome_email_sent_at</code> (timestamp) - Records when the welcome email was sent</li>
          </ul>

          <div className="mt-6">
            <button
              onClick={addColumns}
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? 'Adding Columns...' : 'Add Welcome Email Columns'}
            </button>
          </div>

          {result && (
            <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
              {result.success ? (
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{result.message}</p>
                  </div>
                </div>
              ) : (
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{result.error}</p>
                    {result.details && (
                      <p className="mt-1 text-sm text-red-700">{result.details}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}