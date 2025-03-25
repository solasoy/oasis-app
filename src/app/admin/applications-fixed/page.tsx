import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/admin-layout';

// Force Next.js to not cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Mock data for development mode
const mockApplications = [
  {
    id: 'mock-app-1',
    his_name: { first: 'John', last: 'Doe' },
    her_name: { first: 'Jane', last: 'Doe' },
    retreat_date: 'June 10-15, 2025',
    submitted_at: new Date().toISOString(),
    status: 'pending',
    profile_created: false
  },
  {
    id: 'mock-app-2',
    his_name: { first: 'Michael', last: 'Smith' },
    her_name: { first: 'Sarah', last: 'Smith' },
    retreat_date: 'July 15-20, 2025',
    submitted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'approved',
    profile_created: true
  },
  {
    id: 'mock-app-3',
    his_name: { first: 'Robert', last: 'Johnson' },
    her_name: { first: 'Emily', last: 'Johnson' },
    retreat_date: 'August 5-10, 2025',
    submitted_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'rejected',
    profile_created: false
  }
];

export default async function ApplicationsList() {
  // Development mode detection
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  try {
    // Create Supabase client
    const supabase = createServerComponentClient({ cookies });
    
    // Fetch applications data
    let applications;
    let error;
    
    if (isDevelopment) {
      console.log('Development mode detected, fetching applications without authentication checks');
      
      // In development mode, fetch applications directly
      const result = await supabase
        .from('applications')
        .select('*')
        .order('submitted_at', { ascending: false });
        
      applications = result.data;
      error = result.error;
      
      if (error) {
        console.error('Error fetching applications in development mode:', error);
        throw error;
      }
    } else {
      // Production mode - check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('Authentication failed');
      }
      
      // Check if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .single();
      
      if (adminError || !adminData) {
        console.error('Admin check error:', adminError);
        throw new Error('Access denied');
      }
      
      // Fetch applications
      const result = await supabase
        .from('applications')
        .select('*')
        .order('submitted_at', { ascending: false });
        
      applications = result.data;
      error = result.error;
      
      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }
    }
    
    // If no applications found, use mock data in development mode
    if ((!applications || applications.length === 0) && isDevelopment) {
      console.log('No applications found, using mock data in development mode');
      applications = mockApplications;
    }
    
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          {isDevelopment && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-sm mb-4">
              Development Mode: Authentication checks bypassed
            </div>
          )}
          
          <h1 className="text-2xl font-bold mb-6">Applications</h1>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Couple</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retreat Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications && applications.length > 0 ? (
                  applications.map((app) => (
                    <tr key={app.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {app.his_name.first} {app.his_name.last} & {app.her_name.first} {app.her_name.last}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{app.retreat_date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(app.submitted_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${app.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            app.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/applications/${app.id}`}
                            className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-600 hover:bg-blue-50"
                          >
                            View
                          </Link>
                          {app.status === 'approved' && (
                            app.profile_created ? (
                              <span className="text-green-600 font-medium px-2 py-1 rounded bg-green-50 border border-green-200">
                                Profile Created
                              </span>
                            ) : (
                              <Link
                                href={`/admin/create-profile?application=${app.id}&edit=true`}
                                className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-600 hover:bg-blue-50"
                              >
                                Edit Profile
                              </Link>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No applications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    );
  } catch (error) {
    console.error('Unexpected error in applications page:', error);
    
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">Unable to load applications. Please try again later.</span>
            {isDevelopment && (
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            )}
          </div>
          
          <div className="mt-6">
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Return to Admin Dashboard
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }
}