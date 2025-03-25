import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardNavigation } from '@/components/dashboard/navigation';
import { FoodPreferencesForm } from '@/components/forms/food-preferences-form';

export default async function FoodPreferencesPage() {
  // Check if user is logged in
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/participant/login');
  }
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Check if user is a participant
  const { data: husbandData } = await supabase
    .from('participants')
    .select('*')
    .eq('husband_email', user?.email)
    .maybeSingle();
    
  const { data: wifeData } = await supabase
    .from('participants')
    .select('*')
    .eq('wife_email', user?.email)
    .maybeSingle();
    
  const participantData = husbandData || wifeData;
  
  if (!participantData) {
    // Sign out if not a participant
    await supabase.auth.signOut();
    redirect('/participant/login');
  }
  
  // Determine if user is husband or wife
  const isHusband = !!husbandData;
  const role = isHusband ? 'husband' : 'wife';
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Food Preferences</h1>
          <p className="text-gray-600">
            Please let us know about any dietary restrictions or preferences.
          </p>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <FoodPreferencesForm 
              participantId={participantData.id}
              role={role}
            />
          </div>
        </div>
      </main>
    </div>
  );
}