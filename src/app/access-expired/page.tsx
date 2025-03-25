import React from 'react';
import Link from 'next/link';

export default function AccessExpiredPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Access Expired
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your access to the Oasis Retreat participant dashboard has expired.
          </p>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Thank you for participating in the Oasis Retreat. Your access to the participant portal has expired
                as your retreat has concluded.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                If you believe this is an error or have any questions, please contact the retreat organizers.
              </p>
            </div>
          </div>
        </div>
        <div className="text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-500">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}