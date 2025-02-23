import { ReactNode } from 'react';

export default function SuccessLayout({ children }: { children: ReactNode }) {
  // This layout has no sidebar, just returns the children directly
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 