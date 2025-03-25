"use client";

import { useState, useEffect } from 'react';

interface ProgressSummaryProps {
  participantId: string;
}

export function ProgressSummary({ participantId }: ProgressSummaryProps) {
  const [progress, setProgress] = useState({
    totalItems: 0,
    completedItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      try {
        // API endpoint will be implemented later
        // For now, just simulate some progress data
        setTimeout(() => {
          setProgress({
            totalItems: 6,
            completedItems: 2
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching progress:', error);
        setLoading(false);
      }
    }

    fetchProgress();
  }, [participantId]);

  const percentComplete = progress.totalItems > 0
    ? Math.round((progress.completedItems / progress.totalItems) * 100)
    : 0;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-2.5 bg-gray-200 rounded-full w-full mb-2"></div>
        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-medium mb-4">Your Progress</h2>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${percentComplete}%` }}
        ></div>
      </div>
      
      <p className="mt-2 text-sm text-gray-600">
        {progress.completedItems} of {progress.totalItems} tasks completed ({percentComplete}%)
      </p>
    </div>
  );
}