import { LoginForm } from '@/components/auth/login-form';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  // Check if user is already logged in
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  // If already logged in, redirect based on role
  if (session) {
    // Check if user is an admin
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check if user email is in admins table
    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('email', user?.email)
      .single();
      
    // Redirect to appropriate dashboard
    if (adminData) {
      redirect('/admin');
    } else {
      redirect('/dashboard');
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your credentials to access the Oasis Retreat platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}