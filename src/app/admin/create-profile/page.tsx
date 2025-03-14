'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/admin-layout';

interface Application {
  id: string;
  his_name: { first: string; last: string };
  her_name: { first: string; last: string };
  his_email: string;
  her_email: string;
  retreat_date: string;
  [key: string]: any;
}

interface PaymentPlan {
  amount: string;
  dueDate: string;
}

export default function CreateProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('application');
  const supabase = createClientComponentClient();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    retreatDate: '',
    husbandFirstName: '',
    husbandLastName: '',
    husbandEmail: '',
    wifeFirstName: '',
    wifeLastName: '',
    wifeEmail: '',
    feeAmount: '3500.00', // Default fee amount
    hasPaymentPlan: 'no',
    paymentPlanType: 'fixed',
    paymentCadence: 'monthly',
    numberOfPayments: 3,
    variablePayments: [{ amount: '', dueDate: '' }] as PaymentPlan[]
  });
  
  // Fetch application data when component mounts
  useEffect(() => {
    if (applicationId) {
      fetchApplication(applicationId);
    } else {
      setLoading(false);
      setError('No application ID provided');
    }
  }, [applicationId]);
  
  const fetchApplication = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch application with associated participant profile
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          participants(*)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setApplication(data);
        
        // Check if profile has already been created for this application
        if (data.profile_created) {
          const isEditMode = searchParams.get('edit') === 'true';
          
          if (isEditMode && data.participants && data.participants.length > 0) {
            // Load existing profile data for editing
            const profile = data.participants[0];
            
            // Parse the retreat date correctly
            let retreatDate = profile.retreat_date || '';
            
            setFormData({
              ...formData,
              retreatDate: retreatDate,
              husbandFirstName: profile.husband_first_name || '',
              husbandLastName: profile.husband_last_name || '',
              husbandEmail: profile.husband_email || '',
              wifeFirstName: profile.wife_first_name || '',
              wifeLastName: profile.wife_last_name || '',
              wifeEmail: profile.wife_email || '',
              feeAmount: profile.fee_amount?.toString() || '3500.00',
              hasPaymentPlan: profile.has_payment_plan ? 'yes' : 'no',
              paymentPlanType: profile.payment_plan_type || 'fixed',
              paymentCadence: profile.payment_cadence || 'monthly',
              numberOfPayments: profile.number_of_payments || 3,
              variablePayments: profile.variable_payments || [{ amount: '', dueDate: '' }]
            });
          } else {
            setError('A profile has already been created for this application. Use the edit option to modify it.');
            // We need to update the application state to reflect that a profile has been created
            data.profile_created = true;
            setSubmitting(true); // Disable form submission
          }
        }
        
        // Get current date for profile creation date
        const today = new Date();
        const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        console.log(`Setting profile creation date to current date: ${currentDate}`);
        
        setFormData({
          ...formData,
          retreatDate: currentDate, // Set to current date instead of retreat date
          husbandFirstName: data.his_name?.first || '',
          husbandLastName: data.his_name?.last || '',
          husbandEmail: data.his_email || '',
          wifeFirstName: data.her_name?.first || '',
          wifeLastName: data.her_name?.last || '',
          wifeEmail: data.her_email || ''
        });
      }
    } catch (error: any) {
      console.error('Error fetching application:', error);
      setError(error.message || 'Failed to fetch application');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handlePaymentPlanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hasPaymentPlan = e.target.value;
    setFormData({ ...formData, hasPaymentPlan });
  };
  
  const handlePaymentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const paymentPlanType = e.target.value;
    setFormData({ ...formData, paymentPlanType });
  };
  
  const handleVariablePaymentChange = (index: number, field: string, value: string) => {
    const updatedPayments = [...formData.variablePayments];
    updatedPayments[index] = { ...updatedPayments[index], [field]: value };
    setFormData({ ...formData, variablePayments: updatedPayments });
  };
  
  const addPayment = () => {
    setFormData({
      ...formData,
      variablePayments: [...formData.variablePayments, { amount: '', dueDate: '' }]
    });
  };
  
  const removePayment = (index: number) => {
    const updatedPayments = formData.variablePayments.filter((_, i) => i !== index);
    setFormData({ ...formData, variablePayments: updatedPayments });
  };
  
  const calculateFixedPayments = () => {
    const feeAmount = parseFloat(formData.feeAmount);
    
    // Check if we have valid dates to calculate payment schedule
    if (!formData.retreatDate || !application?.retreat_date) {
      return { amount: 0, numberOfPayments: 0 };
    }
    
    // Calculate time between profile creation date and retreat date
    const profileCreationDate = new Date(formData.retreatDate);
    
    // Parse retreat date correctly if it's in the format "March 5-9, 2025"
    let retreatDateStr = application.retreat_date;
    if (retreatDateStr.includes('-')) {
      const match = retreatDateStr.match(/([A-Za-z]+)\s+(\d+)[-–]\d+,\s+(\d{4})/);
      if (match) {
        const [_, month, day, year] = match;
        // Create a proper date object with the correct year
        const date = new Date(`${month} ${day}, ${year}`);
        // Format the date as YYYY-MM-DD
        retreatDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        console.log(`Parsed retreat date in calculateFixedPayments: ${retreatDateStr} from "${application.retreat_date}"`);
      }
    }
    
    const retreatDate = new Date(retreatDateStr);
    
    // If dates are invalid or retreat date is before profile creation date, return 0
    if (isNaN(profileCreationDate.getTime()) || isNaN(retreatDate.getTime()) ||
        retreatDate <= profileCreationDate) {
      return { amount: 0, numberOfPayments: 0 };
    }
    
    // Calculate days between dates
    const daysBetween = Math.floor((retreatDate.getTime() - profileCreationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate number of payments based on cadence
    let numberOfPayments = 1;
    if (formData.paymentCadence === 'weekly') {
      numberOfPayments = Math.floor(daysBetween / 7);
    } else if (formData.paymentCadence === 'biweekly') {
      numberOfPayments = Math.floor(daysBetween / 14);
    } else if (formData.paymentCadence === 'monthly') {
      numberOfPayments = Math.floor(daysBetween / 30);
    }
    
    // Ensure at least 1 payment
    numberOfPayments = Math.max(1, numberOfPayments);
    
    // Calculate equal payments
    const paymentAmount = (feeAmount / numberOfPayments).toFixed(2);
    
    return { amount: paymentAmount, numberOfPayments };
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we're in edit mode
    const isEditMode = searchParams.get('edit') === 'true';
    
    // Check if profile has already been created for this application
    if (application?.profile_created && !isEditMode) {
      setError('A profile has already been created for this application.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      if (!applicationId) throw new Error('No application ID provided');
      
      // Validate form data
      if (!formData.retreatDate) throw new Error('Profile creation date is required');
      if (!formData.husbandFirstName || !formData.husbandLastName) throw new Error('Husband name is required');
      if (!formData.wifeFirstName || !formData.wifeLastName) throw new Error('Wife name is required');
      if (!formData.husbandEmail) throw new Error('Husband email is required');
      if (!formData.wifeEmail) throw new Error('Wife email is required');
      if (!formData.feeAmount || isNaN(parseFloat(formData.feeAmount))) throw new Error('Valid fee amount is required');
      
      // Validate profile creation date and retreat date
      const profileCreationDate = new Date(formData.retreatDate);
      
      // Parse retreat date correctly if it's in the format "March 5-9, 2025"
      let retreatDateStr = application?.retreat_date || '';
      if (retreatDateStr.includes('-')) {
        const match = retreatDateStr.match(/([A-Za-z]+)\s+(\d+)[-–]\d+,\s+(\d{4})/);
        if (match) {
          const [_, month, day, year] = match;
          // Create a proper date object with the correct year
          const date = new Date(`${month} ${day}, ${year}`);
          // Format the date as YYYY-MM-DD
          retreatDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          console.log(`Parsed retreat date in handleSubmit: ${retreatDateStr} from "${application?.retreat_date}"`);
        }
      }
      
      const retreatDate = new Date(retreatDateStr);
      
      if (isNaN(profileCreationDate.getTime())) {
        throw new Error('Invalid profile creation date');
      }
      
      if (isNaN(retreatDate.getTime())) {
        throw new Error('Invalid retreat date');
      }
      
      if (retreatDate <= profileCreationDate) {
        throw new Error('Retreat date must be after profile creation date');
      }
      
      // For fixed payment plans, we calculate the number of payments automatically
      // No validation needed here as the number of payments is determined by the system
      
      // Validate variable payments if applicable
      if (formData.hasPaymentPlan === 'yes' && formData.paymentPlanType === 'variable') {
        const totalAmount = formData.variablePayments.reduce((sum, payment) => {
          return sum + (parseFloat(payment.amount) || 0);
        }, 0);
        
        const feeAmount = parseFloat(formData.feeAmount);
        
        if (Math.abs(totalAmount - feeAmount) > 0.01) {
          throw new Error(`Total of variable payments (${totalAmount.toFixed(2)}) must equal the fee amount (${feeAmount.toFixed(2)})`);
        }
        
        // Get profile creation date and retreat date for validation
        const profileCreationDate = new Date(formData.retreatDate);
        
        // Parse retreat date correctly if it's in the format "March 5-9, 2025"
        let retreatDateStr = application?.retreat_date || '';
        if (retreatDateStr.includes('-')) {
          const match = retreatDateStr.match(/([A-Za-z]+)\s+(\d+)[-–]\d+,\s+(\d{4})/);
          if (match) {
            const [_, month, day, year] = match;
            // Create a proper date object with the correct year
            const date = new Date(`${month} ${day}, ${year}`);
            // Format the date as YYYY-MM-DD
            retreatDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            console.log(`Parsed retreat date in variable payment validation: ${retreatDateStr} from "${application?.retreat_date}"`);
          }
        }
        
        const retreatDate = new Date(retreatDateStr);
        
        if (isNaN(profileCreationDate.getTime())) {
          throw new Error('Invalid profile creation date');
        }
        
        if (isNaN(retreatDate.getTime())) {
          throw new Error('Invalid retreat date');
        }
        
        if (retreatDate <= profileCreationDate) {
          throw new Error('Retreat date must be after profile creation date');
        }
        
        // Check that all payments have valid amounts and dates
        formData.variablePayments.forEach((payment, index) => {
          if (!payment.amount || isNaN(parseFloat(payment.amount))) {
            throw new Error(`Payment ${index + 1} has an invalid amount`);
          }
          
          if (!payment.dueDate) {
            throw new Error(`Payment ${index + 1} is missing a due date`);
          }
          
          // Validate payment date is between profile creation date and retreat date
          const paymentDate = new Date(payment.dueDate);
          
          if (isNaN(paymentDate.getTime())) {
            throw new Error(`Payment ${index + 1} has an invalid date`);
          }
          
          if (paymentDate < profileCreationDate) {
            throw new Error(`Payment ${index + 1} date must be on or after the profile creation date`);
          }
          
          if (paymentDate > retreatDate) {
            throw new Error(`Payment ${index + 1} date must be before the retreat date`);
          }
        });
      }
      
      // Get current date for created_at field
      const now = new Date();
      const createdAtDate = now.toISOString();
      
      // Prepare participant data
      const participantData = {
        application_id: applicationId,
        retreat_date: formData.retreatDate,
        created_at: createdAtDate, // Add created_at field with current date and time
        husband_first_name: formData.husbandFirstName,
        husband_last_name: formData.husbandLastName,
        husband_email: formData.husbandEmail,
        wife_first_name: formData.wifeFirstName,
        wife_last_name: formData.wifeLastName,
        wife_email: formData.wifeEmail,
        fee_amount: parseFloat(formData.feeAmount),
        has_payment_plan: formData.hasPaymentPlan === 'yes',
        payment_plan_type: formData.hasPaymentPlan === 'yes' ? formData.paymentPlanType : null,
        payment_cadence: formData.hasPaymentPlan === 'yes' && formData.paymentPlanType === 'fixed' ? formData.paymentCadence : null,
        number_of_payments: formData.hasPaymentPlan === 'yes' && formData.paymentPlanType === 'fixed' ?
          calculateFixedPayments().numberOfPayments :
          (formData.hasPaymentPlan === 'yes' && formData.paymentPlanType === 'variable' ?
            formData.variablePayments.length : null),
        variable_payments: formData.hasPaymentPlan === 'yes' && formData.paymentPlanType === 'variable' ? formData.variablePayments : null
      };
      
      console.log('Creating participant with data:', JSON.stringify(participantData, null, 2));
      
      // Check if we're updating an existing profile or creating a new one
      if (isEditMode && application?.participants && application.participants.length > 0) {
        // Update existing participant record
        const profileId = application.participants[0].id;
        
        // For updates, we should preserve the original created_at date
        // Remove created_at from participantData to avoid overwriting it
        const { created_at, ...updateData } = participantData;
        
        console.log('Updating participant with data:', JSON.stringify(updateData, null, 2));
        
        const { error: participantError } = await supabase
          .from('participants')
          .update(updateData)
          .eq('id', profileId);
          
        if (participantError) {
          throw participantError;
        }
        
        // Redirect to success page or back to intake
        router.push('/admin/intake?success=true&action=updated');
      } else {
        // Insert new participant record
        const { data: participant, error: participantError } = await supabase
          .from('participants')
          .insert(participantData)
          .select()
          .single();
          
        if (participantError) {
          // Check for unique constraint violation (code 23505)
          if (participantError.code === '23505') {
            // Update application state to reflect that a profile has been created
            if (application) {
              setApplication({
                ...application,
                profile_created: true
              });
            }
            throw new Error('A profile has already been created for this application.');
          }
          throw participantError;
        }
        
        // Update application to mark profile as created
        const { error: updateError } = await supabase
          .from('applications')
          .update({ profile_created: true })
          .eq('id', applicationId);
          
        if (updateError) throw updateError;
        
        // Create user accounts and send welcome emails
        const accountResponse = await fetch('/api/admin/create-couple-accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profileId: participant.id,
            husbandEmail: formData.husbandEmail,
            wifeEmail: formData.wifeEmail,
          }),
        });
        
        const accountData = await accountResponse.json();
        
        if (!accountResponse.ok) {
          throw new Error(accountData.error || 'Failed to create user accounts');
        }
        
        // Redirect to success page or back to intake
        router.push('/admin/intake?success=true&action=created');
      }
      
    } catch (error: any) {
      console.error('Error creating/updating profile:', error);
      setError(error.message || 'Failed to create/update profile');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  if (error && !application) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Link href="/admin/intake" className="text-blue-600 hover:underline">
            Return to Intake
          </Link>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {searchParams.get('edit') === 'true' ? 'Edit' : 'Create'} Participant Profile
          </h1>
          <Link href="/admin/intake" className="text-blue-600 hover:underline">
            Back to Intake
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {application?.his_name.first} {application?.his_name.last} & {application?.her_name.first} {application?.her_name.last}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Creating participant profile for retreat on {application?.retreat_date}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="border-t border-gray-200">
            <div className="px-4 py-5 bg-gray-50 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-1 sm:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                </div>
                
                <div>
                  <label htmlFor="retreatDate" className="block text-sm font-medium text-gray-700">
                    Profile Creation Date
                  </label>
                  <input
                    type="date"
                    name="retreatDate"
                    id="retreatDate"
                    value={formData.retreatDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This date marks the starting date of the payment plan and should be before the retreat date.
                  </p>
                </div>
                
                <div className="col-span-1 sm:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 mt-6 mb-4">Husband Information</h4>
                </div>
                
                <div>
                  <label htmlFor="husbandFirstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="husbandFirstName"
                    id="husbandFirstName"
                    value={formData.husbandFirstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="husbandLastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="husbandLastName"
                    id="husbandLastName"
                    value={formData.husbandLastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div className="col-span-1 sm:col-span-2">
                  <label htmlFor="husbandEmail" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="husbandEmail"
                    id="husbandEmail"
                    value={formData.husbandEmail}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div className="col-span-1 sm:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 mt-6 mb-4">Wife Information</h4>
                </div>
                
                <div>
                  <label htmlFor="wifeFirstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="wifeFirstName"
                    id="wifeFirstName"
                    value={formData.wifeFirstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="wifeLastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="wifeLastName"
                    id="wifeLastName"
                    value={formData.wifeLastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div className="col-span-1 sm:col-span-2">
                  <label htmlFor="wifeEmail" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="wifeEmail"
                    id="wifeEmail"
                    value={formData.wifeEmail}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div className="col-span-1 sm:col-span-2">
                  <h4 className="text-lg font-medium text-gray-900 mt-6 mb-4">Payment Information</h4>
                </div>
                
                <div className="col-span-1 sm:col-span-2">
                  <label htmlFor="feeAmount" className="block text-sm font-medium text-gray-700">
                    Fee Amount ($)
                  </label>
                  <input
                    type="number"
                    name="feeAmount"
                    id="feeAmount"
                    value={formData.feeAmount}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="col-span-1 sm:col-span-2">
                  <fieldset>
                    <legend className="text-sm font-medium text-gray-700">Payment Plan</legend>
                    <div className="mt-2 space-y-4">
                      <div className="flex items-center">
                        <input
                          id="paymentPlanNo"
                          name="hasPaymentPlan"
                          type="radio"
                          value="no"
                          checked={formData.hasPaymentPlan === 'no'}
                          onChange={handlePaymentPlanChange}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label htmlFor="paymentPlanNo" className="ml-3 block text-sm font-medium text-gray-700">
                          No Payment Plan (Full Payment)
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="paymentPlanYes"
                          name="hasPaymentPlan"
                          type="radio"
                          value="yes"
                          checked={formData.hasPaymentPlan === 'yes'}
                          onChange={handlePaymentPlanChange}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label htmlFor="paymentPlanYes" className="ml-3 block text-sm font-medium text-gray-700">
                          Use Payment Plan
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>
                
                {formData.hasPaymentPlan === 'yes' && (
                  <>
                    <div className="col-span-1 sm:col-span-2">
                      <label htmlFor="paymentPlanType" className="block text-sm font-medium text-gray-700">
                        Plan Type
                      </label>
                      <select
                        id="paymentPlanType"
                        name="paymentPlanType"
                        value={formData.paymentPlanType}
                        onChange={handlePaymentTypeChange}
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="fixed">Fixed (Equal Payments)</option>
                        <option value="variable">Variable (Custom Payments)</option>
                      </select>
                    </div>
                    
                    {formData.paymentPlanType === 'fixed' && (
                      <>
                        <div>
                          <label htmlFor="paymentCadence" className="block text-sm font-medium text-gray-700">
                            Payment Cadence
                          </label>
                          <select
                            id="paymentCadence"
                            name="paymentCadence"
                            value={formData.paymentCadence}
                            onChange={handleInputChange}
                            className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="weekly">Weekly</option>
                            <option value="biweekly">Bi-weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                        
                        {/* Number of payments is now calculated automatically based on cadence and date range */}
                        
                        <div className="col-span-1 sm:col-span-2">
                          <div className="mt-4 p-4 bg-gray-50 rounded-md">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Payment Summary</h5>
                            {formData.retreatDate && application?.retreat_date ? (
                              <>
                                <p className="text-sm text-gray-600">
                                  {calculateFixedPayments().numberOfPayments} {formData.paymentCadence} payments of ${calculateFixedPayments().amount} each
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  Total: ${parseFloat(formData.feeAmount).toFixed(2)}
                                </p>
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="text-xs text-gray-500">
                                    Payment period: {new Date(formData.retreatDate).toLocaleDateString()} to {(() => {
                                      // Parse retreat date correctly if it's in the format "March 5-9, 2025"
                                      let retreatDateStr = application.retreat_date;
                                      if (retreatDateStr.includes('-')) {
                                        const match = retreatDateStr.match(/([A-Za-z]+)\s+(\d+)[-–]\d+,\s+(\d{4})/);
                                        if (match) {
                                          const [_, month, day, year] = match;
                                          // Create a proper date object with the correct year
                                          const date = new Date(`${month} ${day}, ${year}`);
                                          return date.toLocaleDateString();
                                        }
                                      }
                                      return new Date(retreatDateStr).toLocaleDateString();
                                    })()}
                                  </p>
                                  {(() => {
                                    // Calculate and display payment dates
                                    const profileCreationDate = new Date(formData.retreatDate);
                                    
                                    // Parse retreat date correctly if it's in the format "March 5-9, 2025"
                                    let retreatDateStr = application.retreat_date;
                                    if (retreatDateStr.includes('-')) {
                                      const match = retreatDateStr.match(/([A-Za-z]+)\s+(\d+)[-–]\d+,\s+(\d{4})/);
                                      if (match) {
                                        const [_, month, day, year] = match;
                                        // Create a proper date object with the correct year
                                        const date = new Date(`${month} ${day}, ${year}`);
                                        // Format the date as YYYY-MM-DD
                                        retreatDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                        console.log(`Parsed retreat date in payment summary: ${retreatDateStr} from "${application.retreat_date}"`);
                                      }
                                    }
                                    
                                    const retreatDate = new Date(retreatDateStr);
                                    
                                    if (isNaN(profileCreationDate.getTime()) || isNaN(retreatDate.getTime()) ||
                                        retreatDate <= profileCreationDate) {
                                      return <p className="text-xs text-red-500 mt-1">Invalid date range</p>;
                                    }
                                    
                                    // Calculate days between dates
                                    const daysBetween = Math.floor((retreatDate.getTime() - profileCreationDate.getTime()) / (1000 * 60 * 60 * 24));
                                    
                                    // Calculate maximum number of payments based on cadence
                                    let maxPayments = 1;
                                    let intervalDays = 30; // default to monthly
                                    
                                    if (formData.paymentCadence === 'weekly') {
                                      maxPayments = Math.floor(daysBetween / 7);
                                      intervalDays = 7;
                                    } else if (formData.paymentCadence === 'biweekly') {
                                      maxPayments = Math.floor(daysBetween / 14);
                                      intervalDays = 14;
                                    } else if (formData.paymentCadence === 'monthly') {
                                      maxPayments = Math.floor(daysBetween / 30);
                                      intervalDays = 30;
                                    }
                                    
                                    // Get the calculated number of payments
                                    const actualPayments = calculateFixedPayments().numberOfPayments;
                                    
                                    // Generate payment dates
                                    const paymentDates = [];
                                    for (let i = 0; i < actualPayments; i++) {
                                      const paymentDate = new Date(profileCreationDate);
                                      paymentDate.setDate(paymentDate.getDate() + (i * intervalDays));
                                      paymentDates.push(paymentDate);
                                    }
                                    
                                    return (
                                      <div className="mt-2 text-xs text-gray-600">
                                        <p className="font-medium">Estimated Payment Dates:</p>
                                        <ul className="mt-1 space-y-1">
                                          {paymentDates.map((date, index) => (
                                            <li key={index}>
                                              Payment {index + 1}: {date.toLocaleDateString()}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </>
                            ) : (
                              <p className="text-sm text-gray-600">
                                Please enter valid profile creation date and ensure retreat date is set.
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {formData.paymentPlanType === 'variable' && (
                      <div className="col-span-1 sm:col-span-2">
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Variable Payments</h5>
                          
                          {formData.variablePayments.map((payment, index) => (
                            <div key={index} className="flex flex-wrap items-center mb-4 gap-4">
                              <div className="w-full sm:w-auto flex-grow">
                                <label htmlFor={`payment-amount-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                                  Amount ($)
                                </label>
                                <input
                                  type="number"
                                  id={`payment-amount-${index}`}
                                  value={payment.amount}
                                  onChange={(e) => handleVariablePaymentChange(index, 'amount', e.target.value)}
                                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  min="0"
                                  step="0.01"
                                  required
                                />
                              </div>
                              <div className="w-full sm:w-auto flex-grow">
                                <label htmlFor={`payment-date-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                                  Due Date
                                </label>
                                <input
                                  type="date"
                                  id={`payment-date-${index}`}
                                  value={payment.dueDate}
                                  onChange={(e) => handleVariablePaymentChange(index, 'dueDate', e.target.value)}
                                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  required
                                />
                              </div>
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => removePayment(index)}
                                  className="mt-6 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                          
                          <button
                            type="button"
                            onClick={addPayment}
                            className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Add Payment
                          </button>
                          
                          <div className="mt-4 p-4 bg-gray-50 rounded-md">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Payment Summary</h5>
                            <p className="text-sm text-gray-600">
                              Total of Variable Payments: $
                              {formData.variablePayments.reduce((sum, payment) => {
                                return sum + (parseFloat(payment.amount) || 0);
                              }, 0).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Fee Amount: ${parseFloat(formData.feeAmount).toFixed(2)}
                            </p>
                            
                            {formData.retreatDate && application?.retreat_date && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                  Valid payment dates: {new Date(formData.retreatDate).toLocaleDateString()} to {(() => {
                                    // Parse retreat date correctly if it's in the format "March 5-9, 2025"
                                    let retreatDateStr = application.retreat_date;
                                    if (retreatDateStr.includes('-')) {
                                      const match = retreatDateStr.match(/([A-Za-z]+)\s+(\d+)[-–]\d+,\s+(\d{4})/);
                                      if (match) {
                                        const [_, month, day, year] = match;
                                        // Create a proper date object with the correct year
                                        const date = new Date(`${month} ${day}, ${year}`);
                                        return date.toLocaleDateString();
                                      }
                                    }
                                    return new Date(retreatDateStr).toLocaleDateString();
                                  })()}
                                </p>
                                
                                {(() => {
                                  // Check if any payment dates are outside the valid range
                                  const profileCreationDate = new Date(formData.retreatDate);
                                  
                                  // Parse retreat date correctly if it's in the format "March 5-9, 2025"
                                  let retreatDateStr = application.retreat_date;
                                  if (retreatDateStr.includes('-')) {
                                    const match = retreatDateStr.match(/([A-Za-z]+)\s+(\d+)[-–]\d+,\s+(\d{4})/);
                                    if (match) {
                                      const [_, month, day, year] = match;
                                      // Create a proper date object with the correct year
                                      const date = new Date(`${month} ${day}, ${year}`);
                                      // Format the date as YYYY-MM-DD
                                      retreatDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                                      console.log(`Parsed retreat date in variable payments: ${retreatDateStr} from "${application.retreat_date}"`);
                                    }
                                  }
                                  
                                  const retreatDate = new Date(retreatDateStr);
                                  
                                  if (isNaN(profileCreationDate.getTime()) || isNaN(retreatDate.getTime()) ||
                                      retreatDate <= profileCreationDate) {
                                    return <p className="text-xs text-red-500 mt-1">Invalid date range</p>;
                                  }
                                  
                                  const invalidPayments = formData.variablePayments.filter(payment => {
                                    if (!payment.dueDate) return false;
                                    
                                    const paymentDate = new Date(payment.dueDate);
                                    return isNaN(paymentDate.getTime()) ||
                                           paymentDate < profileCreationDate ||
                                           paymentDate > retreatDate;
                                  });
                                  
                                  if (invalidPayments.length > 0) {
                                    return (
                                      <p className="text-xs text-red-500 mt-1">
                                        Warning: {invalidPayments.length} payment(s) have dates outside the valid range
                                      </p>
                                    );
                                  }
                                  
                                  return null;
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                type="button"
                onClick={() => router.push('/admin/intake')}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || (application?.profile_created && !searchParams.get('edit'))}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  application?.profile_created && !searchParams.get('edit')
                    ? 'bg-gray-500'
                    : (searchParams.get('edit') === 'true' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700')
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  (submitting || (application?.profile_created && !searchParams.get('edit'))) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting
                  ? (searchParams.get('edit') === 'true' ? 'Updating Profile...' : 'Creating Profile...')
                  : (application?.profile_created && !searchParams.get('edit')
                      ? 'Profile Already Created'
                      : (searchParams.get('edit') === 'true' ? 'Update Profile' : 'Create Profile')
                    )
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}