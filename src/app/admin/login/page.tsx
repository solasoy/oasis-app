import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLoginPage() {
  // Check if user is already logged in
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  // If already logged in, check if admin
  if (session) {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check if user email is in admins table
    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('email', user?.email)
      .single();
      
    // If admin, redirect to admin dashboard
    if (adminData) {
      redirect('/admin');
    } else {
      // If not admin, redirect to participant dashboard
      redirect('/dashboard');
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Sign In
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your credentials to access the Oasis Retreat admin portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AdminLoginForm />
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Link 
                href="/"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Return to home page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}