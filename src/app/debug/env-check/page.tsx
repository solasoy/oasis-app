'use client';

import { useState, useEffect } from 'react';

export default function EnvCheckPage() {
  const [envVars, setEnvVars] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkEnv = async () => {
      try {
        const response = await fetch('/api/debug/show-env');
        const data = await response.json();
        setEnvVars(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkEnv();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Environment Check</h1>
      
      {loading ? (
        <p>Loading environment variables...</p>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      ) : (
        <div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Current Environment Variables</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                These are the masked values of your current Supabase environment variables.
              </p>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Supabase URL</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {envVars?.supabaseUrl || 'Not set'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Supabase Anon Key</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {envVars?.supabaseAnonKey || 'Not set'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Supabase Service Key</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {envVars?.supabaseServiceKey || 'Not set'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Node Environment</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {envVars?.nodeEnv || 'Not set'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">How to Update Environment Variables</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Follow these steps to update your Supabase environment variables.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5">
              <ol className="list-decimal pl-5 space-y-4">
                <li>
                  <p className="text-sm text-gray-700">
                    Open your <code className="bg-gray-100 px-1 py-0.5 rounded">.env.local</code> file in the root of your project.
                  </p>
                </li>
                <li>
                  <p className="text-sm text-gray-700">
                    Update the following variables with your Supabase project credentials:
                  </p>
                  <pre className="bg-gray-100 p-3 rounded-md mt-2 text-sm overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`}
                  </pre>
                </li>
                <li>
                  <p className="text-sm text-gray-700">
                    You can find these values in your Supabase project dashboard:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-2 text-sm text-gray-700">
                    <li>Go to <a href="https://app.supabase.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">https://app.supabase.io</a> and select your project</li>
                    <li>Click on "Settings" in the sidebar</li>
                    <li>Select "API" to find your project URL and keys</li>
                  </ul>
                </li>
                <li>
                  <p className="text-sm text-gray-700">
                    Restart your development server after updating the environment variables:
                  </p>
                  <pre className="bg-gray-100 p-3 rounded-md mt-2 text-sm">
{`npm run dev`}
                  </pre>
                </li>
              </ol>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}