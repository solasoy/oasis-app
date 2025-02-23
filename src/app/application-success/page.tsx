'use client';

import Link from 'next/link';

export default function ApplicationSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center max-w-lg px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Application Submitted Successfully!
        </h1>
        
        <p className="text-lg text-gray-600 mb-4">
          Thank you for submitting your application. You will receive a confirmation email shortly.
        </p>
        
        <p className="text-gray-600 mb-8">
          Please check your email for further instructions regarding the next steps in the process.
        </p>

        <Link 
          href="/"
          className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-md 
            hover:bg-indigo-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
} 