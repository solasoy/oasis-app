'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Check for development auth token
    const authToken = localStorage.getItem('dev_auth');
    if (!authToken) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to Your Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage your retreat application and profile here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Application Status Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900">Application Status</h2>
          <p className="mt-2 text-gray-600">Your application is pending review.</p>
        </div>

        {/* Upcoming Retreat Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Retreat</h2>
          <p className="mt-2 text-gray-600">March 5-9, 2025</p>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="mt-4 space-y-2">
            <button 
              onClick={() => router.push('/dashboard/profile')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Update Profile
            </button>
            <button 
              onClick={() => router.push('/dashboard/application')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
            >
              View Application
            </button>
            <button 
              onClick={() => window.location.href = 'mailto:support@example.com'}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 