'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RetreatDate {
  id: string;
  display_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface ApplicationRetreatDateProps {
  applicationId: string;
  currentRetreatDate: string;
}

export function ApplicationRetreatDate({ 
  applicationId, 
  currentRetreatDate 
}: ApplicationRetreatDateProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retreatDates, setRetreatDates] = useState<RetreatDate[]>([]);
  const [selectedDate, setSelectedDate] = useState(currentRetreatDate);
  
  // Fetch available retreat dates
  useEffect(() => {
    if (isEditing) {
      const fetchRetreatDates = async () => {
        try {
          const response = await fetch('/api/admin/retreat-dates');
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch retreat dates');
          }
          
          setRetreatDates(result.data);
        } catch (err: any) {
          setError(err.message || 'An error occurred');
        }
      };
      
      fetchRetreatDates();
    }
  }, [isEditing]);
  
  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/retreat-date`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ retreat_date: selectedDate })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update retreat date');
      }
      
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isEditing) {
    return (
      <div className="flex items-center">
        <span className="mr-2">{currentRetreatDate}</span>
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-900 text-sm"
        >
          Edit
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <div className="flex items-center space-x-2">
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
        >
          <option value={currentRetreatDate}>{currentRetreatDate}</option>
          {retreatDates
            .filter(date => date.display_name !== currentRetreatDate && date.is_active)
            .map(date => (
              <option key={date.id} value={date.display_name}>
                {date.display_name}
              </option>
            ))}
        </select>
        
        <button
          onClick={handleSave}
          disabled={isLoading || selectedDate === currentRetreatDate}
          className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        
        <button
          onClick={() => setIsEditing(false)}
          disabled={isLoading}
          className="px-3 py-1 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}