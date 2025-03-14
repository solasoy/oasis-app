'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface AdminTileProps {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}

export function AdminTile({ title, description, href, icon }: AdminTileProps) {
  return (
    <Link 
      href={href}
      className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50 transition-colors duration-200"
    >
      <div className="flex items-center mb-2">
        <div className="mr-3 text-blue-500">
          {icon}
        </div>
        <h5 className="text-xl font-bold tracking-tight text-gray-900">
          {title}
        </h5>
      </div>
      <p className="font-normal text-gray-700">
        {description}
      </p>
    </Link>
  );
}