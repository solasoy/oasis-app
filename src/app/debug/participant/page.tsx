'use client';

import { useState } from 'react';

export default function DebugParticipantPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkParticipant = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/participants/check?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Participant</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="flex">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-l-md border border-gray-300 p-2"
            placeholder="Enter email address"
          />
          <button
            onClick={checkParticipant}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Result</h2>
          
          <div className="mb-4">
            <p className="font-medium">Participant Found: {result.found ? 'Yes' : 'No'}</p>
            {result.found && (
              <>
                <p>Found as: {result.asHusband ? 'Husband' : ''} {result.asWife ? 'Wife' : ''}</p>
                
                {result.husbandData && (
                  <div className="mt-2">
                    <h3 className="font-medium">Husband Data:</h3>
                    <p>Name: {result.husbandData.name}</p>
                    <p>Email: {result.husbandData.email}</p>
                    <p>Has Auth ID: {result.husbandData.hasAuthId ? 'Yes' : 'No'}</p>
                    <p>Has Temp Password: {result.husbandData.hasTempPassword ? 'Yes' : 'No'}</p>
                  </div>
                )}
                
                {result.wifeData && (
                  <div className="mt-2">
                    <h3 className="font-medium">Wife Data:</h3>
                    <p>Name: {result.wifeData.name}</p>
                    <p>Email: {result.wifeData.email}</p>
                    <p>Has Auth ID: {result.wifeData.hasAuthId ? 'Yes' : 'No'}</p>
                    <p>Has Temp Password: {result.wifeData.hasTempPassword ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div>
            <h3 className="font-medium">All Participants ({result.allParticipantsCount}):</h3>
            {result.sampleEmails.length > 0 ? (
              <ul className="list-disc pl-5 mt-2">
                {result.sampleEmails.map((emails: any, index: number) => (
                  <li key={index}>
                    Husband: {emails.husband || 'N/A'}, Wife: {emails.wife || 'N/A'}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No participants found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}