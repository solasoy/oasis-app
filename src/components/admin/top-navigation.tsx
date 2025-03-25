'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function AdminTopNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDevelopment, setIsDevelopment] = useState(false);
  
  // Check if we're in development mode
  useEffect(() => {
    setIsDevelopment(window.location.hostname === 'localhost');
  }, []);

  // Only create Supabase client if not in development mode
  const supabase = !isDevelopment ? createClientComponentClient() : null;

  const navigation = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Retreat Dates', href: '/admin/retreat-dates' },
    { name: 'Applications', href: '/admin/applications' },
    { name: 'Intake', href: '/admin/intake' },
    { name: 'Email', href: '/admin/email' },
    { name: 'Documents', href: '/admin/documents' },
    { name: 'Reports', href: '/admin/reports' },
  ];

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      if (isDevelopment) {
        console.log('Development mode detected, bypassing Supabase signOut');
        router.push('/');
        router.refresh();
      } else if (supabase) {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/admin" className="text-xl font-bold text-blue-600">
                OCC Oasis Admin
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 ml-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/admin' && pathname?.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap"
              >
                Return to Home
              </Link>
              <button
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap"
              >
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}