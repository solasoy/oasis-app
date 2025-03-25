import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { AdminLoginForm } from '@/components/auth/admin-login-form';

export default async function AdminLoginPage() {
  // Development mode bypass - render a simple page with a link
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 DEV AUTH: Admin Login Page in Development Mode');
    
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Development Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Development mode detected - authentication bypassed
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="space-y-4">
              <Link 
                href="/admin"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Access Admin Dashboard
              </Link>
              
              <Link 
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Home
              </Link>
            </div>
            
            <div className="mt-6 bg-yellow-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-yellow-800">Development Mode Notice</h3>
              <p className="mt-1 text-xs text-yellow-700">
                Authentication is bypassed in development mode. Click the button above to access the admin dashboard directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Production authentication logic
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