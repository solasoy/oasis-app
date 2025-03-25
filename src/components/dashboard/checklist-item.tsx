"use client";

import { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import Link from 'next/link';

interface ChecklistItemProps {
  item: {
    id: string;
    title: string;
    description: string;
    type: 'couple' | 'individual';
    requiredRole: 'husband' | 'wife' | null;
    completed: boolean;
    actionUrl?: string;
  };
  participantId: string;
}

export function ChecklistItem({ item, participantId }: ChecklistItemProps) {
  const [isCompleted, setIsCompleted] = useState(item.completed);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAction = async () => {
    if (item.actionUrl) {
      window.location.href = item.actionUrl;
    } else if (item.title === 'Payment') {
      // Open payment iframe
      // Implementation depends on the payment portal integration
      console.log('Payment action clicked');
    }
  };
  
  return (
    <div className="p-6 flex items-start space-x-4">
      <div className="flex-shrink-0 pt-1">
        {isCompleted ? (
          <CheckCircle className="h-6 w-6 text-green-500" />
        ) : (
          <Circle className="h-6 w-6 text-gray-300" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
          {item.requiredRole && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {item.requiredRole === 'husband' ? 'Husband' : 'Wife'}
            </span>
          )}
        </div>
        
        <p className="mt-1 text-sm text-gray-500">{item.description}</p>
        
        {!isCompleted && (
          <div className="mt-4">
            <button 
              onClick={handleAction}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : `Complete ${item.title}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}