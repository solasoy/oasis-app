import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ParticipantAccessButtonProps {
  participantId: string;
  role: 'husband' | 'wife';
  label?: string;
  className?: string;
}

export const ParticipantAccessButton: React.FC<ParticipantAccessButtonProps> = ({
  participantId,
  role,
  label,
  className = '',
}) => {
  // Default label based on role
  const defaultLabel = `Access ${role === 'husband' ? 'Husband' : 'Wife'} Dashboard`;
  const buttonLabel = label || defaultLabel;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/access-participant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to access participant dashboard');
      }

      // Redirect to the dashboard or specified URL
      router.push(data.redirectUrl || '/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      window.alert(`Failed to access participant dashboard: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <button
        onClick={handleClick}
        disabled={loading}
        className={`px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        type="button"
      >
        {loading ? 'Accessing...' : buttonLabel}
      </button>
    </div>
  );
};