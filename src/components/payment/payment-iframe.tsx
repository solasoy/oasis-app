"use client";

import { useState, useEffect } from 'react';

interface PaymentIframeProps {
  participantId: string;
}

export function PaymentIframe({ participantId }: PaymentIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // In a real implementation, this would be a payment processor iframe
  // For now, we'll just simulate a payment form
  
  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call to process payment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the checklist item status
      const response = await fetch('/api/checklist/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
          checklistItemId: '2', // ID of the payment checklist item
          completed: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }
      
      // Redirect or show success message
      window.location.href = '/participant/checklist';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred processing your payment');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Simulate loading payment processor
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Please complete your payment using the form below. Your payment information is securely processed.
      </p>
      
      <div className="border border-gray-300 rounded-md p-4 space-y-4">
        <div>
          <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
            Card Number
          </label>
          <input
            type="text"
            id="card-number"
            placeholder="1234 5678 9012 3456"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <input
              type="text"
              id="expiry"
              placeholder="MM/YY"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
              CVC
            </label>
            <input
              type="text"
              id="cvc"
              placeholder="123"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name on Card
          </label>
          <input
            type="text"
            id="name"
            placeholder="John Doe"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <button
            onClick={handlePayment}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Pay $500.00
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center">
          This is a demo payment form. No actual payment will be processed.
        </p>
      </div>
    </div>
  );
}