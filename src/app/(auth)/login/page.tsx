import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { LoginForm } from '@/components/auth/login-form';

export default async function LoginPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    // If user is already logged in, redirect to dashboard
    redirect('/dashboard');
  }

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <LoginForm />
    </div>
  );
}