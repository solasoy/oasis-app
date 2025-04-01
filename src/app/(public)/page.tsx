import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Function to get the next upcoming retreat date
async function getNextRetreatDate() {
  try {
    const now = new Date();
    
    // Get active retreat dates with start date in the future
    const { data, error } = await supabase
      .from('retreat_dates')
      .select('*')
      .eq('is_active', true)
      .gte('start_date', now.toISOString().split('T')[0])
      .order('start_date', { ascending: true })
      .limit(1);
    
    if (error) throw error;
    
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching next retreat date:', error);
    return null;
  }
}

export default async function HomePage() {
  // Fetch the next upcoming retreat date
  const nextRetreat = await getNextRetreatDate();
  const isDevMode = process.env.NODE_ENV === 'development';
  
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">OCC Oasis</span>
          <span className="block text-blue-600">Garden Experience</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Welcome to our couples retreat experience. Join us for a rejuvenating getaway
          designed to strengthen your marriage and deepen your connection.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <Link
              href="/apply"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mt-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Application */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Application</h3>
              <p className="mt-2 text-sm text-gray-500">
                Begin your journey by submitting your application for the retreat.
              </p>
              <Link
                href="/apply"
                className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Start Application <span className="ml-1">→</span>
              </Link>
            </div>
          </div>

          {/* Participant */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Participant Portal</h3>
              <p className="mt-2 text-sm text-gray-500">
                Access your retreat information and manage your preferences.
              </p>
              <Link
                href="/participant/login"
                className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Go to Participant Portal <span className="ml-1">→</span>
              </Link>
            </div>
          </div>

          {/* Admin */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Admin Portal</h3>
              <p className="mt-2 text-sm text-gray-500">
                Access the administrative portal to manage applications and participants.
              </p>
              <div className="flex flex-col space-y-2">
                <Link
                  href="/admin-bypass"
                  className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Go to Admin Portal (Dev Mode) <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white shadow rounded-lg mt-8">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900">About the Retreat</h2>
          <p className="mt-4 text-gray-500">
            The OCC Oasis Garden Experience is a five-day intensive retreat designed
            for couples seeking to strengthen their marriage. Located in Sunnyvale, TX,
            this immersive experience provides a unique opportunity for couples to focus
            on their relationship while being guided through transformative sessions and
            activities. The next retreat is scheduled for {nextRetreat?.display_name || 'June 9-12, 2025'}.
          </p>
          <p className="mt-4 text-gray-500">
            During your stay, you'll remain on the beautiful property, away from daily 
            distractions, allowing you to fully engage in the retreat experience. Our 
            program combines spiritual guidance, practical workshops, and dedicated time 
            for couples to connect and grow together.
          </p>
        </div>
      </div>
    </div>
  );
}