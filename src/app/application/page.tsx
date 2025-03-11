import { ApplicationForm } from '@/components/forms/application-form';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function ApplicationPage() {
  // Check if user is logged in
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is logged in, redirect them to dashboard
  // This prevents accessing the application form from the dashboard
  if (session) {
    redirect('/dashboard');
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Retreat Application</h1>
        <p className="mt-2 text-gray-600">Please complete all required fields.</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <ApplicationForm />
      </div>
    </div>
  );
}