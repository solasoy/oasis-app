import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { ApplicationActionsFixed } from '@/components/admin/application-actions-fixed';
import { ApplicationRetreatDate } from '@/components/admin/application-retreat-date';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ApplicationDetailFixed({ params }: { params: { id: string } }) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const supabase = createServerComponentClient({ cookies });
  
  try {
    // Fetch application data
    const { data: application, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (error || !application) {
      console.error('Error fetching application:', error);
      notFound();
    }
    
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          {isDevelopment && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-sm mb-4">
              Development Mode: Authentication checks bypassed
            </div>
          )}
          
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Application Details</h1>
            <Link href="/admin/applications-fixed" className="text-blue-600 hover:underline">
              Back to Applications
            </Link>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {application.his_name.first} {application.his_name.last} & {application.her_name.first} {application.her_name.last}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Submitted on {new Date(application.submitted_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${application.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    application.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                  {application.status}
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Retreat Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ApplicationRetreatDate
                      applicationId={application.id}
                      currentRetreatDate={application.retreat_date}
                    />
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">His Information</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <p>Name: {application.his_name.first} {application.his_name.last}</p>
                    <p>Age: {application.his_age}</p>
                    <p>Email: {application.his_email}</p>
                    <p>Phone: {application.his_phone}</p>
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Her Information</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <p>Name: {application.her_name.first} {application.her_name.last}</p>
                    <p>Age: {application.her_age}</p>
                    <p>Email: {application.her_email}</p>
                    <p>Phone: {application.her_phone}</p>
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <p>{application.address.line1}</p>
                    {application.address.line2 && <p>{application.address.line2}</p>}
                    <p>{application.address.city}, {application.address.state} {application.address.postal}</p>
                    <p>{application.address.country}</p>
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Church Membership</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {application.is_occ_member === 'yes' ? 'Yes' : 'No'}
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Faith Background</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {application.is_christ_follower === 'yes' ? 'Yes' : 'No'}
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Wedding Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {application.wedding_date}
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Living Arrangement</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {application.living_arrangement === 'together' ? 'Together' : 'Separated'}
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Children</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {application.children_details}
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Previous Marriage</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {application.previous_marriage_details}
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Reason for Retreat</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {application.retreat_reason}
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Previous Therapy</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {application.previous_therapy === 'yes' ? 'Yes' : 'No'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          <ApplicationActionsFixed
            applicationId={application.id}
            status={application.status}
            profileCreated={application.profile_created}
          />
        </div>
      </AdminLayout>
    );
  } catch (error) {
    console.error('Unexpected error in application detail page:', error);
    
    return (
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">Unable to load application details. Please try again later.</span>
            {isDevelopment && (
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            )}
          </div>
          
          <div className="mt-6">
            <Link
              href="/admin/applications-fixed"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Return to Applications
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }
}