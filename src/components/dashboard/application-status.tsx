'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { LoadingSpinner } from '@/components/ui/loading';

type ApplicationStatus = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  retreat_date: string;
};

export function ApplicationStatus() {
  const [status, setStatus] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('applications')
          .select('id, status, submitted_at, retreat_date')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        setStatus(data);
      } catch (err) {
        console.error('Error fetching application status:', err);
        setError('Failed to load application status');
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, [supabase]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!status) return <div>No application found</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <span className={`inline-block h-3 w-3 rounded-full ${
          status.status === 'approved' ? 'bg-green-500' :
          status.status === 'rejected' ? 'bg-red-500' :
          'bg-yellow-500'
        }`} />
        <span className="font-medium capitalize">{status.status}</span>
      </div>
      <div className="text-sm text-gray-600">
        <p>Submitted: {new Date(status.submitted_at).toLocaleDateString()}</p>
        <p>Retreat Date: {status.retreat_date}</p>
      </div>
    </div>
  );
} 