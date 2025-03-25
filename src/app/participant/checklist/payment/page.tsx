import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardNavigation } from '@/components/dashboard/navigation';
import { PaymentScheduleTable } from '@/components/payment/payment-schedule-table';
import { PaymentIframe } from '@/components/payment/payment-iframe';

export default async function PaymentPage() {
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
  
  // For now, we'll use mock data until the payment plan tables are implemented
  const paymentPlan = {
    id: '1',
    payment_cadence: 'monthly',
    number_of_payments: 3,
    amount_per_payment: 500,
    remaining_amount: 1000,
    payment_start_date: new Date().toISOString()
  };
  
  const paymentSchedule: {
    id: string;
    scheduled_date: string;
    amount: number;
    status: 'scheduled' | 'completed' | 'missed';
    payment_reference: string | null;
  }[] = [
    {
      id: '1',
      scheduled_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 500,
      status: 'completed',
      payment_reference: 'REF123456'
    },
    {
      id: '2',
      scheduled_date: new Date().toISOString(),
      amount: 500,
      status: 'scheduled',
      payment_reference: null
    },
    {
      id: '3',
      scheduled_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 500,
      status: 'scheduled',
      payment_reference: null
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Payment</h1>
          
          {paymentPlan ? (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">Payment Plan</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Payment Cadence</dt>
                    <dd className="mt-1 text-sm text-gray-900">{paymentPlan.payment_cadence}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Number of Payments</dt>
                    <dd className="mt-1 text-sm text-gray-900">{paymentPlan.number_of_payments}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Amount Per Payment</dt>
                    <dd className="mt-1 text-sm text-gray-900">${paymentPlan.amount_per_payment}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Remaining Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900">${paymentPlan.remaining_amount}</dd>
                  </div>
                </dl>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">Payment Schedule</h2>
                <PaymentScheduleTable schedule={paymentSchedule} />
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium mb-4">Make a Payment</h2>
                <PaymentIframe participantId={participantData.id} />
              </div>
            </>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow">
              <p>No payment plan found. Please contact the administrator.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}