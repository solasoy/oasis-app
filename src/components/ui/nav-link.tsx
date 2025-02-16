"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        'inline-flex items-center px-3 py-2 text-sm font-medium',
        isActive
          ? 'text-blue-600'
          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
      )}
    >
      {children}
    </Link>
  );
}