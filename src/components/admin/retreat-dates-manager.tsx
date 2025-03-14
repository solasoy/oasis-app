'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface RetreatDate {
  id: string;
  start_date: string;
  end_date: string;
  display_name: string;
  is_active: boolean;
}

interface RetreatDatesManagerProps {
  initialDates: RetreatDate[];
}

export function RetreatDatesManager({ initialDates }: RetreatDatesManagerProps) {
  const router = useRouter();
  const [retreatDates, setRetreatDates] = useState<RetreatDate[]>(initialDates);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newDate, setNewDate] = useState({
    start_date: '',
    end_date: '',
    display_name: ''
  });
  
  // Add state for dialog
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: null as 'delete' | 'deactivate' | null,
    dateId: null as string | null,
    dateStatus: null as boolean | null
  });
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDate(prev => ({ ...prev, [name]: value }));
  };
  
  // Validation function
  const validateDates = () => {
    const errors = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const startDate = new Date(newDate.start_date);
    const endDate = new Date(newDate.end_date);
    
    if (startDate < now) {
      errors.push('Start date must be in the future');
    }
    
    if (endDate < startDate) {
      errors.push('End date must be after start date');
    }
    
    return errors;
  };
  
  // Create new retreat date
  const handleCreateDate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Validate dates
    const validationErrors = validateDates();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/admin/retreat-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDate)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create retreat date');
      }
      
      setRetreatDates(prev => [...prev, result.data]);
      setNewDate({
        start_date: '',
        end_date: '',
        display_name: ''
      });
      
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update delete handler to open dialog
  const handleDeleteDate = (id: string) => {
    setDialogState({
      isOpen: true,
      type: 'delete',
      dateId: id,
      dateStatus: null
    });
  };
  
  // Update toggle active handler to open dialog
  const handleToggleActive = (id: string, currentStatus: boolean) => {
    setDialogState({
      isOpen: true,
      type: 'deactivate',
      dateId: id,
      dateStatus: currentStatus
    });
  };
  
  // Add confirmation handlers
  const handleConfirmAction = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (dialogState.type === 'delete' && dialogState.dateId) {
        const response = await fetch(`/api/admin/retreat-dates/${dialogState.dateId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Failed to delete retreat date');
        }
        
        setRetreatDates(prev => prev.filter(date => date.id !== dialogState.dateId));
      } else if (dialogState.type === 'deactivate' && dialogState.dateId && dialogState.dateStatus !== null) {
        const response = await fetch(`/api/admin/retreat-dates/${dialogState.dateId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ is_active: !dialogState.dateStatus })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to update retreat date');
        }
        
        setRetreatDates(prev =>
          prev.map(date =>
            date.id === dialogState.dateId ? { ...date, is_active: !dialogState.dateStatus } : date
          )
        );
      }
      
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
      setDialogState({ isOpen: false, type: null, dateId: null, dateStatus: null });
    }
  };
  
  const handleCancelAction = () => {
    setDialogState({ isOpen: false, type: null, dateId: null, dateStatus: null });
  };
  
  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Add new retreat date form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Add New Retreat Date</h2>
        <form onSubmit={handleCreateDate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={newDate.start_date}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                name="end_date"
                value={newDate.end_date}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Display Name</label>
              <input
                type="text"
                name="display_name"
                value={newDate.display_name}
                onChange={handleInputChange}
                placeholder="e.g., March 5-9, 2025"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Retreat Date'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Retreat dates list */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Display Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {retreatDates.length > 0 ? (
              retreatDates.map((date) => (
                <tr key={date.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {date.display_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(date.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(date.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      date.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {date.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleActive(date.id, date.is_active)}
                        className={`text-sm px-2 py-1 rounded ${
                          date.is_active
                            ? 'text-yellow-600 hover:text-yellow-900 border border-yellow-600 hover:bg-yellow-50'
                            : 'text-green-600 hover:text-green-900 border border-green-600 hover:bg-green-50'
                        }`}
                      >
                        {date.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteDate(date.id)}
                        className="text-red-600 hover:text-red-900 text-sm px-2 py-1 rounded border border-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No retreat dates found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={dialogState.isOpen}
        title={dialogState.type === 'delete' ? 'Delete Retreat Date' : 'Change Retreat Date Status'}
        message={
          dialogState.type === 'delete'
            ? 'Are you sure you want to delete this retreat date? This action cannot be undone.'
            : `Are you sure you want to ${dialogState.dateStatus ? 'deactivate' : 'activate'} this retreat date?`
        }
        confirmLabel={dialogState.type === 'delete' ? 'Delete' : dialogState.dateStatus ? 'Deactivate' : 'Activate'}
        cancelLabel="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        isDestructive={dialogState.type === 'delete'}
      />
    </div>
  );
}