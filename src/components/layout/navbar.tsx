"use client";

import { NavLink } from '@/components/ui/nav-link';
import { useState, useEffect } from 'react';

const navItemsBase = [
  { name: 'Home', href: '/' },
  { name: 'Apply', href: '/apply' },
  { name: 'Donations', href: '/donate' },
  { name: 'Participant', href: '/participant/login' },
  // Admin link will be added dynamically
];

export function Navbar() {
  const [isDevMode, setIsDevMode] = useState(false);
  const [navItems, setNavItems] = useState(navItemsBase);

  useEffect(() => {
    // Check hostname on client-side to determine dev mode
    const dev = window.location.hostname === 'localhost';
    setIsDevMode(dev);
    
    // Add the Admin link dynamically based on mode
    setNavItems([
      ...navItemsBase,
      { name: 'Admin', href: dev ? '/admin-bypass' : '/admin/login' },
    ]);
  }, []);

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