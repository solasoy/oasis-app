'use client';

import { useState } from 'react';

interface ResetAuthButtonProps {
  participantId: string;
}

export function ResetAuthButton({ participantId }: ResetAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleResetAuth = async () => {
    if (!confirm('Are you sure you want to reset the authentication IDs for this participant? This will delete and recreate their auth accounts.')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/participants/reset-auth-ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset auth IDs');
      }

      setResult({ success: true });
      alert('Auth IDs have been reset successfully. The participant can now log in with their temporary passwords.');
    } catch (error) {
      console.error('Error resetting auth IDs:', error);
      setResult({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={handleResetAuth}
        disabled={loading}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
      >
        {loading ? 'Resetting...' : 'Reset Auth IDs'}
      </button>
      
      {result?.success && (
        <p className="mt-1 text-sm text-green-600">Auth IDs reset successfully.</p>
      )}
      
      {result?.error && (
        <p className="mt-1 text-sm text-red-600">{result.error}</p>
      )}
    </div>
  );
}