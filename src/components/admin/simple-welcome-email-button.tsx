"use client";

import { useState } from 'react';

interface SimpleWelcomeEmailButtonProps {
  participantId: string;
}

export default function SimpleWelcomeEmailButton({ participantId }: SimpleWelcomeEmailButtonProps) {
  const [clicked, setClicked] = useState(false);

  return (
    <div>
      <button
        onClick={() => setClicked(!clicked)}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Simple Email Button
      </button>
      {clicked && <div className="mt-2 text-green-600">Button clicked for participant: {participantId}</div>}
    </div>
  );
}