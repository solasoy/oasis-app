import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AuthTestComponent } from '@/components/admin/auth-test-component';
import { ApplicationsTestComponent } from '@/components/admin/applications-test-component';

// Force Next.js to not cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ApplicationsTestPage() {
  // Development mode detection
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Applications Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium">NODE_ENV:</div>
            <div>{process.env.NODE_ENV}</div>
            
            <div className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</div>
            <div>{process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set'}</div>
            
            <div className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</div>
            <div>{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not Set'}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Test</h2>
          <p className="mb-4">This section will attempt to create a Supabase client and check authentication status without fetching data.</p>
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            {isDevelopment ? (
              <div className="text-green-600 font-medium">
                Development Mode: Authentication checks would normally happen here
              </div>
            ) : (
              <AuthCheckComponent />
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Authentication Test</h2>
          <p className="mb-4">This section will test the authentication API endpoint.</p>
          
          <AuthTestComponent />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Applications API Test</h2>
          <p className="mb-4">This section will test the applications API endpoint.</p>
          
          <ApplicationsTestComponent />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex space-x-4">
            <Link 
              href="/admin/applications"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Applications Page
            </Link>
            <Link 
              href="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Return to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// This component is only rendered in production mode
async function AuthCheckComponent() {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return (
        <div className="text-red-600">
          <p className="font-bold">Authentication Error:</p>
          <pre className="text-sm mt-2 whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
        </div>
      );
    }
    
    if (!user) {
      return (
        <div className="text-yellow-600">
          <p className="font-bold">No User Found</p>
          <p>You are not currently authenticated.</p>
        </div>
      );
    }
    
    return (
      <div className="text-green-600">
        <p className="font-bold">Authentication Successful</p>
        <p>Logged in as: {user.email}</p>
      </div>
    );
  } catch (error) {
    return (
      <div className="text-red-600">
        <p className="font-bold">Unexpected Error:</p>
        <pre className="text-sm mt-2 whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
}