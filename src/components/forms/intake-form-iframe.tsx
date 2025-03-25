"use client";

import { useState, useEffect } from 'react';

interface IntakeFormIframeProps {
  participantId: string;
  role: 'husband' | 'wife';
}

export function IntakeFormIframe({ participantId, role }: IntakeFormIframeProps) {
  const [iframeUrl, setIframeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  useEffect(() => {
    // In a real implementation, this would be a Google Form or other form provider URL
    // For now, we'll just simulate a form with a timeout
    const timer = setTimeout(() => {
      // This would be the actual Google Apps Script published URL
      // const baseUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
      // setIframeUrl(`${baseUrl}?participantId=${participantId}&role=${role}`);
      
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [participantId, role]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call to update checklist status
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Determine which checklist item ID to update based on role
      const checklistItemId = role === 'husband' ? '3' : '4';
      
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
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update intake form status');
      }
      
      setIsSubmitted(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = '/participant/checklist';
      }, 2000);
    } catch (error) {
      console.error('Error submitting intake form:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (isSubmitted) {
    return (
      <div className="bg-green-50 border-l-4 border-green-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-green-700">
              Your intake form has been submitted successfully! Redirecting to checklist...
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // In a real implementation, this would be an iframe to a Google Form
  // For now, we'll just render a simple form
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
          First Name
        </label>
        <input
          type="text"
          id="first-name"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      
      <div>
        <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
          Last Name
        </label>
        <input
          type="text"
          id="last-name"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          type="text"
          id="address"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            id="city"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State
          </label>
          <input
            type="text"
            id="state"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
            ZIP
          </label>
          <input
            type="text"
            id="zip"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="emergency-contact" className="block text-sm font-medium text-gray-700">
          Emergency Contact Name
        </label>
        <input
          type="text"
          id="emergency-contact"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      
      <div>
        <label htmlFor="emergency-phone" className="block text-sm font-medium text-gray-700">
          Emergency Contact Phone
        </label>
        <input
          type="tel"
          id="emergency-phone"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      
      <div>
        <label htmlFor="medical-conditions" className="block text-sm font-medium text-gray-700">
          Medical Conditions
        </label>
        <textarea
          id="medical-conditions"
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        ></textarea>
      </div>
      
      <div>
        <label htmlFor="medications" className="block text-sm font-medium text-gray-700">
          Current Medications
        </label>
        <textarea
          id="medications"
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        ></textarea>
      </div>
      
      <div>
        <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
          Allergies
        </label>
        <textarea
          id="allergies"
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        ></textarea>
      </div>
      
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Submit Intake Form
        </button>
      </div>
    </form>
  );
}