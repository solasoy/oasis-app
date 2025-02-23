"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function DashboardSidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'home' },
    { name: 'Application', href: '/dashboard/application', icon: 'document' },
    { name: 'Profile', href: '/dashboard/profile', icon: 'user' },
    { name: 'Settings', href: '/dashboard/settings', icon: 'cog' },
  ];

  return (
    <aside className="w-64 bg-white border-r">
      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    text-gray-600 hover:text-gray-900
                  `}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
} 