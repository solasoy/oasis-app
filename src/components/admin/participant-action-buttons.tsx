'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ParticipantActionButtonsProps {
  participant: {
    id: string;
    profile_created: boolean;
    husband_temp_password?: string;
    wife_temp_password?: string;
    husband_auth_id?: string;
    wife_auth_id?: string;
    husband_email: string;
    wife_email: string;
    welcome_email_sent?: boolean;
  };
}

export const ParticipantActionButtons: React.FC<ParticipantActionButtonsProps> = ({ participant }) => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState({
    view: false,
    edit: false,
    delete: false,
    setLoginAccess: false,
    sendWelcomeEmail: false
  });
  const [error, setError] = useState<string | null>(null);

  // Determine button states
  const canSetLoginAccess =
    participant.profile_created &&
    !!participant.husband_temp_password &&
    !!participant.wife_temp_password;

  const canSendWelcomeEmail =
    participant.profile_created &&
    !!participant.husband_temp_password &&
    !!participant.wife_temp_password;

  const handleView = () => {
    router.push(`/admin/participants/${participant.id}`);
  };

  const handleEdit = () => {
    router.push(`/admin/create-profile?application=${participant.id}&edit=true`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this participant profile?')) return;

    setLoading(prev => ({ ...prev, delete: true }));
    setError(null);

    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', participant.id);

      if (error) throw error;

      // Optionally update the UI or redirect
      router.refresh();

      // Reset application status
      const response = await fetch(`/api/applications/${participant.id}`, {
        method: 'PUT'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reset application status');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete participant or reset status');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleSetLoginAccess = async () => {
    if (!canSetLoginAccess) return;

    setLoading(prev => ({ ...prev, setLoginAccess: true }));
    setError(null);

    try {
      const response = await fetch('/api/participants/set-login-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId: participant.id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set login access');
      }

      // Check the response status
      if (data.status === 'already_set') {
        alert(data.message || 'Login access already set for this participant');
      } else {
        alert('Login access successfully set');
        router.refresh(); // Refresh only if access was newly set
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set login access');
    } finally {
      setLoading(prev => ({ ...prev, setLoginAccess: false }));
    }
  };

  const handleSendWelcomeEmail = async () => {
    if (!canSendWelcomeEmail) return;

    setLoading(prev => ({ ...prev, sendWelcomeEmail: true }));
    setError(null);

    try {
      const response = await fetch('/api/admin/send-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          participantId: participant.id,
          role: 'both'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send welcome email');
      }

      // Optionally update the UI or show success message
      alert('Welcome email sent successfully');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send welcome email');
    } finally {
      setLoading(prev => ({ ...prev, sendWelcomeEmail: false }));
    }
  };

  return (
    <div className="flex space-x-2">
      {error && (
        <div className="text-red-500 text-sm mb-2">
          {error}
        </div>
      )}
      
      <button 
        onClick={handleView}
        disabled={loading.view}
        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading.view ? 'Loading...' : 'View'}
      </button>

      <button 
        onClick={handleEdit}
        disabled={loading.edit}
        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
      >
        {loading.edit ? 'Loading...' : 'Edit'}
      </button>

      <button 
        onClick={handleDelete}
        disabled={loading.delete}
        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
      >
        {loading.delete ? 'Deleting...' : 'Delete'}
      </button>

      <button 
        onClick={handleSetLoginAccess}
        disabled={!canSetLoginAccess || loading.setLoginAccess}
        className={`px-2 py-1 rounded ${
          canSetLoginAccess 
            ? 'bg-purple-500 text-white hover:bg-purple-600' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        } disabled:opacity-50`}
      >
        {loading.setLoginAccess
          ? 'Processing...'
          : (participant.husband_auth_id || participant.wife_auth_id)
            ? 'Reset Login Access'
            : 'Set Login Access'}
      </button>

      <button 
        onClick={handleSendWelcomeEmail}
        disabled={!canSendWelcomeEmail || loading.sendWelcomeEmail}
        className={`px-2 py-1 rounded ${
          canSendWelcomeEmail
            ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        } disabled:opacity-50`}
      >
        {loading.sendWelcomeEmail
          ? 'Sending...'
          : participant.welcome_email_sent
            ? 'Resend Welcome Email'
            : 'Send Welcome Email'}
      </button>
    </div>
  );
};