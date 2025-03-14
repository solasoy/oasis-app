import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';

export default async function ParticipantProfilePage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies });
  
  // Define participant type
  interface Participant {
    id: string;
    application_id: string;
    husband_first_name: string;
    husband_last_name: string;
    husband_email: string;
    wife_first_name: string;
    wife_last_name: string;
    wife_email: string;
    retreat_date: string;
    fee_amount: number;
    has_payment_plan: boolean;
    payment_plan_type?: 'fixed' | 'variable';
    payment_cadence?: string;
    number_of_payments?: number;
    variable_payments?: any[];
    created_at: string;
    applications?: any;
  }

  // First, try to fetch the participant profile by ID (in case the URL contains a participant ID)
  let participant: Participant | null = null;
  let participantError;
  
  try {
    const result = await supabase
      .from('participants')
      .select(`
        *,
        applications(*)
      `)
      .eq('id', params.id)
      .single();
    
    participant = result.data;
    participantError = result.error;
  } catch (error) {
    console.error('Error fetching participant by ID:', error);
    participantError = error;
  }
  
  // If participant not found by ID, try to fetch by application_id
  if (!participant) {
    try {
      const result = await supabase
        .from('participants')
        .select(`
          *,
          applications(*)
        `)
        .eq('application_id', params.id)
        .single();
      
      participant = result.data;
      participantError = result.error;
    } catch (error) {
      console.error('Error fetching participant by application_id:', error);
      participantError = error;
    }
  }
  
  // If participant still not found, fetch the application
  let application;
  let applicationError;
  
  if (!participant) {
    try {
      const result = await supabase
        .from('applications')
        .select('*')
        .eq('id', params.id)
        .single();
      
      application = result.data;
      applicationError = result.error;
    } catch (error) {
      console.error('Error fetching application:', error);
      applicationError = error;
    }
  }
  
  // If neither participant nor application is found, show 404
  if (!participant && !application) {
    console.error('Error fetching participant or application:', participantError || applicationError);
    notFound();
  }
  
  // Determine if we're showing an existing profile or a placeholder for a non-existent profile
  const hasProfile = !!participant;
  const displayData = hasProfile ? participant : application;
  
  // Create a safe participant object to avoid TypeScript errors
  // This is only used when hasProfile is true, so we can safely cast
  const safeParticipant = participant as Participant;
  
  // Debug information
  console.log('Participant data:', participant ? 'Found' : 'Not found');
  console.log('Application data:', application ? 'Found' : 'Not found');
  console.log('Participant applications:', JSON.stringify(participant?.applications));
  console.log('Retreat date from participant:', participant?.retreat_date);
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Participant Profile</h1>
          <Link href="/admin/intake" className="text-blue-600 hover:underline">
            Back to Intake
          </Link>
        </div>
        
        {hasProfile ? (
          // Display existing participant profile
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {safeParticipant.husband_first_name} {safeParticipant.husband_last_name} & {safeParticipant.wife_first_name} {safeParticipant.wife_last_name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Created on {new Date(safeParticipant.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Retreat Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {safeParticipant.applications?.retreat_date || safeParticipant.retreat_date}
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Husband Information</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <p>Name: {safeParticipant.husband_first_name} {safeParticipant.husband_last_name}</p>
                    <p>Email: {safeParticipant.husband_email}</p>
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Wife Information</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <p>Name: {safeParticipant.wife_first_name} {safeParticipant.wife_last_name}</p>
                    <p>Email: {safeParticipant.wife_email}</p>
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Payment Information</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <p>Fee Amount: ${safeParticipant.fee_amount}</p>
                    <p>Payment Plan: {safeParticipant.has_payment_plan ? 'Yes' : 'No'}</p>
                    
                    {safeParticipant.has_payment_plan && (
                      <>
                        <p>Plan Type: {safeParticipant.payment_plan_type === 'fixed' ? 'Fixed (Equal Payments)' : 'Variable (Custom Payments)'}</p>
                        
                        {safeParticipant.payment_plan_type === 'fixed' && (
                          <>
                            <p>Payment Cadence: {safeParticipant.payment_cadence}</p>
                            <p>Number of Payments: {safeParticipant.number_of_payments}</p>
                            <p>Payment Amount: ${(safeParticipant.fee_amount / (safeParticipant.number_of_payments || 1)).toFixed(2)}</p>
                            
                            <div className="mt-2">
                              <p className="font-medium">Payment Schedule:</p>
                              <table className="min-w-full divide-y divide-gray-200 mt-2">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {Array.from({ length: safeParticipant.number_of_payments || 0 }).map((_, index) => {
                                    // Calculate due date based on payment cadence
                                    const retreatDate = new Date(safeParticipant.retreat_date);
                                    let dueDate = new Date(retreatDate);
                                    
                                    // For the first payment, use retreat date
                                    if (index === 0) {
                                      dueDate = retreatDate;
                                    } else {
                                      // For subsequent payments, add months based on cadence and index
                                      if (safeParticipant.payment_cadence === 'monthly') {
                                        dueDate.setMonth(retreatDate.getMonth() + index);
                                      } else if (safeParticipant.payment_cadence === 'biweekly') {
                                        dueDate.setDate(retreatDate.getDate() + (index * 14));
                                      } else if (safeParticipant.payment_cadence === 'weekly') {
                                        dueDate.setDate(retreatDate.getDate() + (index * 7));
                                      }
                                    }
                                    
                                    return (
                                      <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          ${(safeParticipant.fee_amount / (safeParticipant.number_of_payments || 1)).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {dueDate.toLocaleDateString()}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}
                        
                        {safeParticipant.payment_plan_type === 'variable' && safeParticipant.variable_payments && (
                          <div className="mt-2">
                            <p className="font-medium">Payment Schedule:</p>
                            <table className="min-w-full divide-y divide-gray-200 mt-2">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment #</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {safeParticipant.variable_payments?.map((payment: any, index: number) => (
                                  <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${payment.amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.dueDate).toLocaleDateString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    )}
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Actions</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex space-x-3">
                      <Link
                        href={`/admin/create-profile?application=${safeParticipant.application_id}&edit=true`}
                        className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-600 hover:bg-blue-50"
                      >
                        Edit Profile
                      </Link>
                      <Link
                        href={`/admin/applications/${safeParticipant.application_id}`}
                        className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-600 hover:bg-blue-50"
                      >
                        View Application
                      </Link>
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ) : (
          // Display placeholder for non-existent profile
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {application.his_name.first} {application.his_name.last} & {application.her_name.first} {application.her_name.last}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Application submitted on {new Date(application.submitted_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 bg-yellow-50">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-yellow-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="text-md font-medium text-yellow-800">Profile Not Created</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      This participant profile has not been created yet. Click the button below to create a profile.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link
                    href={`/admin/create-profile?application=${application.id}&edit=true`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Profile
                  </Link>
                  <Link
                    href={`/admin/applications/${application.id}`}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Application
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}