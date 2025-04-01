import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ParticipantActionButtons } from '@/components/admin/participant-action-buttons';

// Force Next.js to not cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function IntakePage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Try to fetch all approved applications with their associated profiles
  const { data: applications, error } = await supabase
    .from('applications')
    .select(`
      *,
      participants:participants(*)
    `)
    .eq('status', 'approved')
    .order('submitted_at', { ascending: false });
  
  // Check if the error is due to missing profile_created column
  const isColumnMissingError = error && error.code === '42703' &&
    error.message.includes('profile_created does not exist');
  
  if (error && !isColumnMissingError) {
    console.error('Error fetching applications:', error);
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Intake</h1>
        <p className="text-gray-600 mb-6">
          Create participant profiles for approved applications. This page allows you to convert approved applications into participant profiles with payment information.
        </p>
        
        {isColumnMissingError ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-medium">
                  Database Setup Required
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  The profile_created column needs to be added to the applications table. Please run the following SQL in your Supabase SQL Editor:
                </p>
                <div className="mt-2 bg-gray-800 text-white p-4 rounded overflow-auto text-sm">
                  <pre>{`-- Add profile_created column to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS profile_created BOOLEAN DEFAULT FALSE;

-- Verify the column was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'applications' AND column_name = 'profile_created';`}</pre>
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  After running the SQL, refresh this page to continue.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Approved Applications</h2>
            
            {applications && applications.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Couple
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Retreat Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((app) => {
                      // Normalize participants to always be an array
                      const participants = Array.isArray(app.participants) 
                        ? app.participants 
                        : (app.participants ? [app.participants] : []);
                      
                      // Use the first participant or create a placeholder
                      const participant = participants[0] || {
                        id: null,
                        profile_created: false,
                        husband_email: `${app.his_name.first} ${app.his_name.last}`,
                        wife_email: `${app.her_name.first} ${app.her_name.last}`,
                        husband_temp_password: null,
                        wife_temp_password: null,
                        husband_auth_id: null,
                        wife_auth_id: null,
                        welcome_email_sent: false
                      };

                      return (
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
                              {app.submitted_at ? (() => {
                                const date = new Date(app.submitted_at);
                                const isoDate = date.toISOString().split('T')[0];
                                return new Date(isoDate + 'T00:00:00').toLocaleDateString();
                              })() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <ParticipantActionButtons 
                              participant={{
                                ...participant,
                                id: participant.id || app.id,
                                profile_created: !!participants.length
                              }} 
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-gray-600">
                  {error ? 'Error loading applications' : 'No approved applications pending intake at this time.'}
                </p>
              </div>
            )}
          </>
        )}
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Intake Process</h2>
          <ol className="list-decimal pl-6 space-y-2 text-gray-700">
            <li>Select an approved application from the list</li>
            <li>Review the application details</li>
            <li>Add payment information</li>
            <li>Configure payment plan (if applicable)</li>
            <li>Create participant accounts</li>
            <li>Send welcome emails</li>
          </ol>
        </div>
      </div>
    </div>
  );
}