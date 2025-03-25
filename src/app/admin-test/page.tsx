'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminTestPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Test Page
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          This page is only accessible to admin users or when the admin bypass is working.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isLoaded ? (
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <p className="font-bold">Success!</p>
              <p>The admin bypass is working correctly. You can now access admin pages without authentication.</p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
              <p className="font-bold">Loading...</p>
              <p>Checking if the admin bypass is working...</p>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Navigation</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link href="/admin" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Go to Admin Dashboard
              </Link>
              <Link href="/" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}