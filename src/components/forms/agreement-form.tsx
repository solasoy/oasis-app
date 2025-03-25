"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AgreementFormProps {
  participantId: string;
  husbandName: string;
  wifeName: string;
}

export function AgreementForm({ participantId, husbandName, wifeName }: AgreementFormProps) {
  const [husbandSignature, setHusbandSignature] = useState('');
  const [wifeSignature, setWifeSignature] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!husbandSignature || !wifeSignature) {
      setError('Both signatures are required');
      setIsSubmitting(false);
      return;
    }

    try {
      // Update the checklist item status
      const response = await fetch('/api/checklist/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
          checklistItemId: '1', // ID of the agreement checklist item
          completed: true,
          data: {
            husbandSignature,
            wifeSignature,
            date,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit agreement');
      }

      // Redirect back to checklist
      router.push('/participant/checklist');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="prose max-w-none mb-8">
        <h2>Oasis Retreat Participation Agreement</h2>
        
        <p>
          This agreement is entered into by and between Oasis Retreat ("Provider") and the undersigned participants.
        </p>
        
        <h3>1. Retreat Participation</h3>
        <p>
          Participants agree to attend all scheduled sessions and activities during the retreat. The retreat is designed as a comprehensive experience, and full participation is essential for maximum benefit.
        </p>
        
        <h3>2. Confidentiality</h3>
        <p>
          Participants agree to maintain the confidentiality of all information shared by other participants during the retreat. This includes personal stories, challenges, and any other sensitive information disclosed during group or private sessions.
        </p>
        
        <h3>3. Respectful Conduct</h3>
        <p>
          Participants agree to conduct themselves in a respectful manner toward facilitators and other participants. This includes listening attentively, speaking honestly but kindly, and respecting different perspectives and experiences.
        </p>
        
        <h3>4. Payment and Cancellation</h3>
        <p>
          Participants understand the payment schedule and cancellation policy as outlined in their registration materials. Refunds for cancellation will be provided according to the policy provided at registration.
        </p>
        
        <h3>5. Photography and Recording</h3>
        <p>
          Participants agree not to record or photograph any sessions without explicit permission from the facilitators and all participants involved.
        </p>
        
        <h3>6. Liability Release</h3>
        <p>
          Participants release the Provider from liability for any physical, emotional, or psychological outcomes of the retreat experience, except in cases of gross negligence.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="husband-signature" className="block text-sm font-medium text-gray-700">
            Husband's Signature
          </label>
          <input
            type="text"
            id="husband-signature"
            value={husbandSignature}
            onChange={(e) => setHusbandSignature(e.target.value)}
            placeholder={husbandName}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="wife-signature" className="block text-sm font-medium text-gray-700">
            Wife's Signature
          </label>
          <input
            type="text"
            id="wife-signature"
            value={wifeSignature}
            onChange={(e) => setWifeSignature(e.target.value)}
            placeholder={wifeName}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Sign Agreement'}
          </button>
        </div>
      </form>
    </div>
  );
}