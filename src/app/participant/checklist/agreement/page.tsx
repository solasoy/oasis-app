import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardNavigation } from '@/components/dashboard/navigation';
import { AgreementForm } from '@/components/forms/agreement-form';

export default async function AgreementPage() {
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Retreat Agreement</h1>
          <p className="text-gray-600">
            Please review the agreement carefully and sign electronically at the bottom.
          </p>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <AgreementForm 
              participantId={participantData.id}
              husbandName={participantData.husband_first_name}
              wifeName={participantData.wife_first_name}
            />
          </div>
        </div>
      </main>
    </div>
  );
}