import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardNavigation } from '@/components/dashboard/navigation';
import { ChecklistItem } from '@/components/dashboard/checklist-item';

export default async function ChecklistPage() {
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
  
  // For now, we'll use mock data until the database schema is implemented
  const checklistItems = [
    {
      id: '1',
      title: 'Signed Agreement',
      description: 'Electronic signature required for retreat participation',
      type: 'couple',
      requiredRole: null,
      completed: false,
      actionUrl: '/participant/checklist/agreement'
    },
    {
      id: '2',
      title: 'Payment',
      description: 'Complete all scheduled payments',
      type: 'couple',
      requiredRole: null,
      completed: false,
      actionUrl: '/participant/checklist/payment'
    },
    {
      id: '3',
      title: 'Intake Form',
      description: 'Complete personal information form',
      type: 'individual',
      requiredRole: 'husband',
      completed: false,
      actionUrl: '/participant/checklist/intake'
    },
    {
      id: '4',
      title: 'Intake Form',
      description: 'Complete personal information form',
      type: 'individual',
      requiredRole: 'wife',
      completed: false,
      actionUrl: '/participant/checklist/intake'
    },
    {
      id: '5',
      title: 'Food Preferences',
      description: 'Indicate dietary restrictions and preferences',
      type: 'individual',
      requiredRole: 'husband',
      completed: false,
      actionUrl: '/participant/checklist/food-preferences'
    },
    {
      id: '6',
      title: 'Food Preferences',
      description: 'Indicate dietary restrictions and preferences',
      type: 'individual',
      requiredRole: 'wife',
      completed: false,
      actionUrl: '/participant/checklist/food-preferences'
    }
  ];
  
  // Determine if user is husband or wife
  const isHusband = !!husbandData;
  const role = isHusband ? 'husband' : 'wife';
  
  // Filter items based on role
  const filteredItems = checklistItems.filter(item => 
    item.type === 'couple' || item.requiredRole === role
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Couple Checklist</h1>
            <span className="text-sm text-gray-500">
              {filteredItems.filter(item => item.completed).length} of {filteredItems.length} completed
            </span>
          </div>
          
          <div className="bg-white rounded-lg shadow divide-y">
            {filteredItems.map((item) => (
              <ChecklistItem 
                key={item.id}
                item={item}
                participantId={participantData.id}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}