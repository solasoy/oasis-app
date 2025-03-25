import { redirect } from 'next/navigation';
import { DevAuthBypass } from '@/lib/dev-auth-bypass';

export default function AdminBypassPage() {
  // Only available in development mode
  if (!DevAuthBypass.isDevMode()) {
    redirect('/');
  }

  DevAuthBypass.traceAuthFlow('Admin Bypass Page', {
    message: 'Direct bypass to admin dashboard'
  });

  // Force redirect to admin dashboard
  redirect('/admin');
}