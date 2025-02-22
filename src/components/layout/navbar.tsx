"use client";

import { NavLink } from '@/components/ui/nav-link';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Apply', href: '/apply' },
  { name: 'Donations', href: '/donate' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Admin', href: '/admin' },
];

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900">OCC Oasis</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}