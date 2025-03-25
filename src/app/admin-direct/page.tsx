import { redirect } from 'next/navigation';
import { DevAuthBypass } from '@/lib/dev-auth-bypass';

export default function AdminDirectPage() {
  // Only available in development mode
  if (!DevAuthBypass.isDevMode()) {
    redirect('/');
  }

  // Force redirect to admin dashboard
  redirect('/admin');
}