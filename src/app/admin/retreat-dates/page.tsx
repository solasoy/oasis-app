import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AdminLayout } from '@/components/admin/admin-layout';
import { RetreatDatesManager } from '@/components/admin/retreat-dates-manager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RetreatDatesPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: retreatDates, error } = await supabase
    .from('retreat_dates')
    .select('*')
    .order('start_date', { ascending: true });
  
  if (error) {
    console.error('Error fetching retreat dates:', error);
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Manage Retreat Dates</h1>
        
        <RetreatDatesManager initialDates={retreatDates || []} />
      </div>
    </AdminLayout>
  );
}