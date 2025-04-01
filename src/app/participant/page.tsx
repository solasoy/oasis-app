import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignOutButton } from '@/components/auth/sign-out-button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ParticipantDashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return redirect('/participant/login');
  }

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/participant/login');
  }

  // Check if user is a participant and get their data
  const { data: participantData, error: participantError } = await supabase
    .from('participants')
    .select('*, retreats(*)')
    .or(`husband_email.eq.${user.email},wife_email.eq.${user.email}`)
    .maybeSingle();

  if (participantError || !participantData) {
    await supabase.auth.signOut();
    return redirect('/participant/login');
  }

  // Check if access has expired
  if (participantData.access_expires_at) {
    const expirationDate = new Date(participantData.access_expires_at);
    const today = new Date();
    expirationDate.setHours(23, 59, 59, 999);
    today.setHours(0, 0, 0, 0);

    if (today > expirationDate) {
      await supabase.auth.signOut();
      return redirect('/access-expired');
    }
  }

  // Determine if user is husband or wife
  const isHusband = participantData.husband_email === user.email;
  const role = isHusband ? 'husband' : 'wife';
  const retreat = participantData.retreats;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Participant Dashboard
          </h1>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Welcome, {isHusband ? participantData.husband_name : participantData.wife_name}!
            </h2>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    You are logged in as the {role} for your retreat. Your access will expire on {new Date(participantData.access_expires_at).toLocaleDateString()}.
                  </p>
                </div>
              </div>
            </div>

            {retreat && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your Retreat Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Retreat Name:</span> {retreat.name}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Start Date:</span> {new Date(retreat.start_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">End Date:</span> {new Date(retreat.end_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Location:</span> {retreat.location || 'TBD'}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Your Schedule</h3>
                  <div className="mt-3 text-sm text-gray-500">
                    <p>View your retreat schedule and upcoming events.</p>
                  </div>
                  <div className="mt-5">
                    <Link
                      href="/participant/schedule"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Schedule
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Resources</h3>
                  <div className="mt-3 text-sm text-gray-500">
                    <p>Access retreat materials and resources.</p>
                  </div>
                  <div className="mt-5">
                    <Link
                      href="/participant/resources"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Resources
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900">Profile</h3>
                  <div className="mt-3 text-sm text-gray-500">
                    <p>Update your profile information and preferences.</p>
                  </div>
                  <div className="mt-5">
                    <Link
                      href="/participant/profile"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}