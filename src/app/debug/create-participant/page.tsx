'use client';

import { useState } from 'react';

export default function CreateTestParticipantPage() {
  const [husbandEmail, setHusbandEmail] = useState('');
  const [wifeEmail, setWifeEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTestParticipant = async () => {
    if (!husbandEmail || !wifeEmail) {
      setError('Both husband and wife emails are required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/debug/create-test-participant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ husbandEmail, wifeEmail }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create test participant');
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Test Participant</h1>
      
      <div className="bg-yellow-50 p-4 rounded-md mb-4">
        <p className="text-yellow-800">
          This page is for testing purposes only. It creates a test participant account with the specified email addresses.
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Husband Email
        </label>
        <input
          type="email"
          value={husbandEmail}
          onChange={(e) => setHusbandEmail(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2"
          placeholder="husband@example.com"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wife Email
        </label>
        <input
          type="email"
          value={wifeEmail}
          onChange={(e) => setWifeEmail(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2"
          placeholder="wife@example.com"
        />
      </div>
      
      <button
        onClick={createTestParticipant}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Test Participant'}
      </button>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md mt-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-green-50 p-4 rounded-md mt-4">
          <h2 className="text-xl font-semibold mb-2">Test Participant Created</h2>
          
          <div className="mb-4">
            <h3 className="font-medium">Husband:</h3>
            <p>Email: {result.participant.husbandEmail}</p>
            <p>Password: {result.participant.husbandPassword}</p>
            <p>Auth ID: {result.participant.husbandAuthId || 'Not created'}</p>
            {result.participant.husbandAuthError && (
              <p className="text-red-600">Error: {result.participant.husbandAuthError}</p>
            )}
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium">Wife:</h3>
            <p>Email: {result.participant.wifeEmail}</p>
            <p>Password: {result.participant.wifePassword}</p>
            <p>Auth ID: {result.participant.wifeAuthId || 'Not created'}</p>
            {result.participant.wifeAuthError && (
              <p className="text-red-600">Error: {result.participant.wifeAuthError}</p>
            )}
          </div>
          
          <div>
            <h3 className="font-medium">Additional Info:</h3>
            <p>Participant ID: {result.participant.id}</p>
            <p>Retreat Date: {new Date(result.participant.retreatDate).toLocaleDateString()}</p>
            <p>Access Expires: {new Date(result.participant.expiresAt).toLocaleDateString()}</p>
          </div>
          
          <div className="mt-4">
            <a 
              href="/participant/login" 
              className="bg-blue-600 text-white px-4 py-2 rounded-md inline-block"
            >
              Go to Login Page
            </a>
          </div>
        </div>
      )}
    </div>
  );
}