import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ParticipantLoginForm } from '@/components/auth/participant-login-form';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ParticipantLoginPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Check if user is already logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    // Check if the user is a participant
    const { data: { user } } = await supabase.auth.getUser();
    
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
    
    if (participantData) {
      return redirect('/participant');
    }
    
    // If not a participant, sign out
    await supabase.auth.signOut();
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <ParticipantLoginForm />
        </div>
      </div>
    </div>
  );
}