"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FoodPreferencesFormProps {
  participantId: string;
  role: 'husband' | 'wife';
}

export function FoodPreferencesForm({ participantId, role }: FoodPreferencesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    dietaryRestrictions: '',
    allergies: '',
    preferences: '',
    otherNotes: '',
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Determine which checklist item ID to update based on role
      const checklistItemId = role === 'husband' ? '5' : '6';
      
      // Update the checklist item status
      const response = await fetch('/api/checklist/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
          checklistItemId,
          completed: true,
          data: formData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit food preferences');
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700">
          Dietary Restrictions
        </label>
        <div className="mt-1">
          <div className="space-y-2">
            {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Kosher', 'Halal'].map((restriction) => (
              <div key={restriction} className="flex items-center">
                <input
                  id={`restriction-${restriction}`}
                  name="dietaryRestrictions"
                  type="radio"
                  value={restriction}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor={`restriction-${restriction}`} className="ml-3 text-sm text-gray-700">
                  {restriction}
                </label>
              </div>
            ))}
            <div className="flex items-center">
              <input
                id="restriction-none"
                name="dietaryRestrictions"
                type="radio"
                value="None"
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="restriction-none" className="ml-3 text-sm text-gray-700">
                None
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
          Food Allergies
        </label>
        <textarea
          id="allergies"
          name="allergies"
          rows={3}
          value={formData.allergies}
          onChange={handleChange}
          placeholder="Please list any food allergies you have"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        ></textarea>
      </div>
      
      <div>
        <label htmlFor="preferences" className="block text-sm font-medium text-gray-700">
          Food Preferences
        </label>
        <textarea
          id="preferences"
          name="preferences"
          rows={3}
          value={formData.preferences}
          onChange={handleChange}
          placeholder="Please list any food preferences you have"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        ></textarea>
      </div>
      
      <div>
        <label htmlFor="otherNotes" className="block text-sm font-medium text-gray-700">
          Other Notes
        </label>
        <textarea
          id="otherNotes"
          name="otherNotes"
          rows={3}
          value={formData.otherNotes}
          onChange={handleChange}
          placeholder="Any other information we should know about your dietary needs"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        ></textarea>
      </div>
      
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Food Preferences'}
        </button>
      </div>
    </form>
  );
}