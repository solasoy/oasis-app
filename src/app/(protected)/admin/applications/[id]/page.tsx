import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ApplicationDetail({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Application Details</h1>
        <Link href="/admin/applications" className="text-blue-600 hover:underline">
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
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{application.retreat_date}</dd>
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
      
      {application.status === 'pending' && (
        <div className="mt-6 flex space-x-4">
          <button 
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            // onClick handler would be added in a client component
          >
            Approve Application
          </button>
          <button 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            // onClick handler would be added in a client component
          >
            Reject Application
          </button>
        </div>
      )}
      
      {application.status === 'approved' && !application.profile_created && (
        <div className="mt-6">
          <Link 
            href={`/admin/create-profile?application=${application.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Create Couple Profile
          </Link>
        </div>
      )}
    </div>
  );
}