"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCircle } from 'lucide-react';

export function DashboardNavigation() {
  const pathname = usePathname();
  
  const navigation = [
    { name: 'Couple Dashboard', href: '/participant' },
    { name: 'Checklist', href: '/participant/checklist' },
  ];
  
  return (
    <nav className="bg-white p-4 shadow-sm w-full border-b">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                px-3 py-2 text-sm font-medium rounded-md
                ${pathname === item.href 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
              `}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <UserMenu />
      </div>
    </nav>
  );
}

function UserMenu() {
  return (
    <div className="relative">
      <button
        className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
        onClick={() => {
          // Toggle dropdown menu in a real implementation
        }}
      >
        <UserCircle className="h-6 w-6 mr-1" />
        <span>Account</span>
      </button>
      {/* Dropdown menu would go here */}
    </div>
  );
}