'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SetupAdminPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    admin?: any;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/setup-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          admin: data.admin,
        });
      } else {
        setResult({
          success: false,
          error: data.error || 'Failed to create admin',
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
          Setup Admin User
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          This page allows you to create an admin user for the Oasis Retreat application.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating...' : 'Create Admin User'}
              </button>
            </div>
          </form>

          {result && (
            <div className="mt-6">
              {result.success ? (
                <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  <p className="font-bold">Success!</p>
                  <p>{result.message}</p>
                  {result.admin && (
                    <div className="mt-2">
                      <p>
                        <strong>Email:</strong> {result.admin.email}
                      </p>
                      <p>
                        <strong>Name:</strong> {result.admin.name}
                      </p>
                    </div>
                  )}
                  <div className="mt-4">
                    <p>
                      You can now{' '}
                      <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
                        log in
                      </Link>{' '}
                      with your Supabase account credentials.
                    </p>
                  </div>
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
                  You must have a Supabase user account with the same email address before adding yourself as an admin.
                </li>
                <li>
                  After creating an admin user, you can log in with your Supabase credentials and will be redirected to the admin dashboard.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}