"use client";

import { useRouter } from 'next/navigation';

export function DashboardHeader() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear the development auth token
    localStorage.removeItem('dev_auth');
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">OCC Retreat</h1>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">John & Jane Doe</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 