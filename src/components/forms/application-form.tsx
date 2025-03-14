"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading';
import { validateApplicationForm, ValidationError } from '@/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

type FormStep = 'retreat' | 'personal' | 'background' | 'review';
type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

// Define validation schema
const applicationSchema = z.object({
  retreatDate: z.string().min(1, 'Retreat date is required'),
  hisName: z.object({
    first: z.string().min(1, 'First name is required'),
    last: z.string().min(1, 'Last name is required')
  }),
  hisAge: z.string().min(1, 'Age is required'),
  hisPhone: z.string().min(10, 'Valid phone number is required'),
  hisEmail: z.string().email('Valid email is required'),
  herName: z.object({
    first: z.string().min(1, 'First name is required'),
    last: z.string().min(1, 'Last name is required')
  }),
  herAge: z.string().min(1, 'Age is required'),
  herPhone: z.string().min(10, 'Valid phone number is required'),
  herEmail: z.string().email('Valid email is required'),
  address: z.object({
    line1: z.string().min(1, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postal: z.string().min(5, 'Valid postal code is required'),
    country: z.string().optional()
  }),
  isOCCMember: z.enum(['yes', 'no']),
  isChristFollower: z.enum(['yes', 'no']),
  weddingDate: z.string().min(1, 'Wedding date is required'),
  livingArrangement: z.enum(['together', 'separate']),
  children_details: z.string()
    .min(1, 'Please answer if you have children and their ages')
    .transform(val => val.trim()),
  previous_marriage_details: z.string()
    .min(1, 'Please answer if you were married before and duration')
    .transform(val => val.trim()),
  retreatReason: z.string().min(1, 'Please provide a reason'),
  previousTherapy: z.enum(['yes', 'no'])
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface RetreatDate {
  id: string;
  display_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export function ApplicationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>('retreat');
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      isOCCMember: 'no',
      isChristFollower: 'no',
      livingArrangement: 'together',
      previousTherapy: 'no'
    }
  });
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [retreatDates, setRetreatDates] = useState<RetreatDate[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(false);

  // Fetch retreat dates on component mount
  useEffect(() => {
    const fetchRetreatDates = async () => {
      setIsLoadingDates(true);
      try {
        const response = await fetch('/api/retreat-dates');
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch retreat dates');
        }
        
        // Filter out inactive dates and sort by start date
        const activeDates = result.data
          .filter((date: RetreatDate) => date.is_active)
          .sort((a: RetreatDate, b: RetreatDate) => 
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
          );
        
        setRetreatDates(activeDates);
        
        // Set default value to the next available date if there is one
        if (activeDates.length > 0) {
          const now = new Date();
          const nextDate = activeDates.find((date: RetreatDate) => 
            new Date(date.start_date) > now
          );
          
          if (nextDate) {
            form.setValue('retreatDate', nextDate.display_name);
          }
        }
      } catch (error) {
        console.error('Error fetching retreat dates:', error);
      } finally {
        setIsLoadingDates(false);
      }
    };
    
    fetchRetreatDates();
  }, [form]);

  const handleInputChange = (
    field: keyof ApplicationFormData,
    value: string | { first: string; last: string } | {
      line1: string;
      line2: string;
      city: string;
      state: string;
      postal: string;
      country: string;
    }
  ) => {
    form.setValue(field as any, value);
  };

  const handleNestedChange = (
    parent: keyof Pick<ApplicationFormData, 'hisName' | 'herName' | 'address'>,
    field: string,
    value: string
  ) => {
    form.setValue(parent, {
      ...form.getValues(parent),
      [field]: value
    });
  };

  const validateStep = (step: FormStep): boolean => {
    switch (step) {
      case 'retreat':
        return !!form.getValues('retreatDate');
      case 'personal':
        return (
          !!form.getValues('hisName.first') && !!form.getValues('hisName.last') &&
          !!form.getValues('herName.first') && !!form.getValues('herName.last') &&
          !!form.getValues('hisAge') && !!form.getValues('herAge') &&
          !!form.getValues('address.line1') && !!form.getValues('address.city') &&
          !!form.getValues('address.state') && !!form.getValues('address.postal') &&
          !!form.getValues('hisPhone') && !!form.getValues('herPhone') &&
          !!form.getValues('hisEmail') && !!form.getValues('herEmail')
        );
      case 'background':
        return (
          !!form.getValues('isOCCMember') && 
          !!form.getValues('isChristFollower') &&
          !!form.getValues('weddingDate') && 
          !!form.getValues('livingArrangement') &&
          !!form.getValues('retreatReason') && 
          !!form.getValues('previousTherapy') &&
          !!form.getValues('children_details') &&
          !!form.getValues('previous_marriage_details')
        );
      default:
        return true;
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    console.log('Form submission started', data);
    try {
      setSubmissionStatus('submitting');

      // Transform the form data to match API expectations
      const apiData = {
        retreatDate: data.retreatDate,
        hisName: data.hisName,
        hisAge: data.hisAge,
        hisPhone: data.hisPhone,
        hisEmail: data.hisEmail,
        herName: data.herName,
        herAge: data.herAge,
        herPhone: data.herPhone,
        herEmail: data.herEmail,
        address: data.address,
        isOCCMember: data.isOCCMember,
        isChristFollower: data.isChristFollower,
        weddingDate: data.weddingDate,
        livingArrangement: data.livingArrangement,
        retreatReason: data.retreatReason,
        previousTherapy: data.previousTherapy,
        children_details: data.children_details,
        previous_marriage_details: data.previous_marriage_details,
        submitted_at: new Date().toISOString()
      };

      // Add logging to verify the data being sent
      console.log('API Data being sent:', {
        children_details: apiData.children_details,
        previous_marriage_details: apiData.previous_marriage_details
      });

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }

      const result = await response.json();
      console.log('Application submitted successfully:', result);

      setSubmissionStatus('success');
      router.push('/application/success');

    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStatus('error');
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Failed to submit application. Please try again.'
      );
    }
  };

  const handleNext = () => {
    console.log('handleNext called, current step:', currentStep);
    
    if (!validateStep(currentStep)) {
      alert('Please fill in all required fields before proceeding.');
      return;
    }

    const steps: FormStep[] = ['retreat', 'personal', 'background', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    console.log('Current index:', currentIndex, 'Next step:', steps[currentIndex + 1]);
    
    // Ensure we can move to the next step
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      console.log('Moving to step:', nextStep);
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    const steps: FormStep[] = ['retreat', 'personal', 'background', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const renderSubmissionStatus = () => {
    if (submissionStatus === 'submitting') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <LoadingSpinner />
            <p className="mt-2">Submitting your application...</p>
          </div>
        </div>
      );
    }

    if (submissionStatus === 'error') {
      return (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {errorMessage}
        </div>
      );
    }

    return null;
  };

  const renderValidationErrors = () => {
    if (validationErrors.length === 0) return null;

    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Please fix the following errors:</strong>
        <ul className="mt-2 list-disc list-inside">
          {validationErrors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderSubmissionStatus()}
      {renderValidationErrors()}
      
      <form 
        className="space-y-8" 
        onSubmit={async (e) => {
          e.preventDefault();
          console.log('Form submitted, current step:', currentStep);
          
          // If not on review step, just go to next step
          if (currentStep !== 'review') {
            console.log('Not on review step, moving to next step');
            handleNext();
            return; // Important: Stop here and don't submit
          }
          
          // Only submit if we're on review step
          console.log('On review step, submitting form');
          await onSubmit(form.getValues());
        }}
      >
        {/* Move Navigation Buttons inside the form */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 'retreat'}
            className={`
              px-4 py-2 text-sm font-medium rounded-md
              ${currentStep === 'retreat'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}
            `}
          >
            Previous
          </button>
          <button
            type={currentStep === 'review' ? 'submit' : 'button'}
            onClick={currentStep !== 'review' ? handleNext : undefined}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            {currentStep === 'review' ? 'Submit' : 'Next'}
          </button>
        </div>

        {/* Step Indicator */}
        <nav aria-label="Progress">
          <ol className="flex items-center justify-center">
            {['Retreat', 'Personal', 'Background', 'Review'].map((step, index) => (
              <li key={step} className="relative flex items-center">
                <div className={`
                  flex h-8 w-8 items-center justify-center rounded-full
                  ${index === ['retreat', 'personal', 'background', 'review'].indexOf(currentStep)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'}
                `}>
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">{step}</span>
                {index < 3 && (
                  <div className="ml-4 mr-4 h-0.5 w-16 bg-gray-200" />
                )}
              </li>
            ))}
          </ol>
        </nav>

        {currentStep === 'retreat' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900">Select Retreat Session</h2>
            <div className="mt-4">
              {isLoadingDates ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner />
                  <span className="text-gray-600">Loading retreat dates...</span>
                </div>
              ) : (
                <select
                  {...form.register('retreatDate')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a retreat date</option>
                  {retreatDates.length > 0 ? (
                    retreatDates.map((date) => (
                      <option key={date.id} value={date.display_name}>
                        {date.display_name}
                      </option>
                    ))
                  ) : (
                    <option value="March 5-9, 2025">March 5-9, 2025</option>
                  )}
                </select>
              )}
            </div>
          </div>
        )}

        {currentStep === 'personal' && (
          <div className="space-y-8">
            <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
            
            {/* His Information */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-gray-700">His Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700">First Name *</label>
                  <input
                    {...form.register('hisName.first')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">Last Name *</label>
                  <input
                    {...form.register('hisName.last')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Age Range *</label>
                <select
                  {...form.register('hisAge')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Age Range</option>
                  <option value="20s">20s</option>
                  <option value="30s">30s</option>
                  <option value="40s">40s</option>
                  <option value="50s">50s</option>
                  <option value="60s">60s</option>
                </select>
              </div>
            </div>

            {/* Her Information */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-gray-700">Her Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700">First Name *</label>
                  <input
                    {...form.register('herName.first')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">Last Name *</label>
                  <input
                    {...form.register('herName.last')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Age Range *</label>
                <select
                  {...form.register('herAge')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Age Range</option>
                  <option value="20s">20s</option>
                  <option value="30s">30s</option>
                  <option value="40s">40s</option>
                  <option value="50s">50s</option>
                  <option value="60s">60s</option>
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-gray-700">Address</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700">Line 1 *</label>
                <input
                  {...form.register('address.line1')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Line 2</label>
                <input
                  {...form.register('address.line2')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700">City *</label>
                  <input
                    {...form.register('address.city')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">State *</label>
                  <input
                    {...form.register('address.state')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700">Postal/Zip Code *</label>
                  <input
                    {...form.register('address.postal')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">Country *</label>
                  <select
                    {...form.register('address.country')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="US">United States</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-gray-700">Contact Information</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700">His Phone Number *</label>
                <input
                  {...form.register('hisPhone')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Her Phone Number *</label>
                <input
                  {...form.register('herPhone')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">His Email *</label>
                <input
                  {...form.register('hisEmail')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Her Email *</label>
                <input
                  {...form.register('herEmail')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Background Information Step */}
        {currentStep === 'background' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Background Information</h2>
            
            {/* Church Membership */}
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Are you members at One Community Church? *
              </label>
              <select
                {...form.register('isOCCMember')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select an option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Faith Background */}
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Are you followers of Christ? *
              </label>
              <select
                {...form.register('isChristFollower')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select an option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Wedding Date */}
            <div>
              <label className="block text-sm font-bold text-gray-700">
                What is your wedding date? *
              </label>
              <input
                {...form.register('weddingDate')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Living Arrangement */}
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Are you living together or separated? *
              </label>
              <select
                {...form.register('livingArrangement')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select an option</option>
                <option value="together">Together</option>
                <option value="separate">Separated</option>
              </select>
            </div>

            {/* Children Question */}
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Do you have children and If so what are their ages? *
              </label>
              <textarea
                {...form.register('children_details')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Example: No children, or Yes - John (12), Mary (8)"
              />
            </div>

            {/* Previous Marriage Question */}
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Were you both married before and if so for how long? *
              </label>
              <textarea
                {...form.register('previous_marriage_details')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Example: No previous marriages, or Yes - Wife was married for 5 years"
              />
            </div>

            {/* Retreat Reason */}
            <div>
              <label className="block text-sm font-bold text-gray-700">
                What issues bring you to request a spot at the marriage intensive retreat? *
              </label>
              <textarea
                {...form.register('retreatReason')}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Previous Therapy */}
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Are you currently or have you previously had couple's therapy? *
              </label>
              <select
                {...form.register('previousTherapy')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select an option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        )}

        {/* Review Step */}
        {currentStep === 'review' && (
          <div className="space-y-8">
            <h2 className="text-lg font-bold text-gray-900">Review Your Application</h2>
            
            {/* Retreat Information */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-gray-700">Retreat Session</h3>
              <p className="text-gray-600">{form.getValues('retreatDate')}</p>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-gray-700">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-bold text-sm text-gray-600">His Name</p>
                  <p className="text-gray-800">{form.getValues('hisName.first')} {form.getValues('hisName.last')}</p>
                  <p className="font-bold text-sm text-gray-600 mt-2">His Age</p>
                  <p className="text-gray-800">{form.getValues('hisAge')}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Her Name</p>
                  <p className="text-gray-800">{form.getValues('herName.first')} {form.getValues('herName.last')}</p>
                  <p className="font-bold text-sm text-gray-600 mt-2">Her Age</p>
                  <p className="text-gray-800">{form.getValues('herAge')}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-gray-700">Contact Information</h3>
              <div>
                <p className="font-bold text-sm text-gray-600">Address</p>
                <p className="text-gray-800">{form.getValues('address.line1')}</p>
                {form.getValues('address.line2') && <p className="text-gray-800">{form.getValues('address.line2')}</p>}
                <p className="text-gray-800">
                  {form.getValues('address.city')}, {form.getValues('address.state')} {form.getValues('address.postal')}
                </p>
                <p className="text-gray-800">{form.getValues('address.country')}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="font-bold text-sm text-gray-600">His Contact</p>
                  <p className="text-gray-800">{form.getValues('hisPhone')}</p>
                  <p className="text-gray-800">{form.getValues('hisEmail')}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Her Contact</p>
                  <p className="text-gray-800">{form.getValues('herPhone')}</p>
                  <p className="text-gray-800">{form.getValues('herEmail')}</p>
                </div>
              </div>
            </div>

            {/* Background Information */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-gray-700">Background Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-sm text-gray-600">Church Membership</p>
                  <p className="text-gray-800">{form.getValues('isOCCMember')}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Faith Background</p>
                  <p className="text-gray-800">{form.getValues('isChristFollower')}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Wedding Date</p>
                  <p className="text-gray-800">{form.getValues('weddingDate')}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Living Arrangement</p>
                  <p className="text-gray-800">{form.getValues('livingArrangement')}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Reason for Retreat</p>
                  <p className="text-gray-800">{form.getValues('retreatReason')}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Previous Therapy</p>
                  <p className="text-gray-800">{form.getValues('previousTherapy')}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Children</p>
                  <p className="text-gray-800">{form.getValues('children_details')}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Previous Marriage</p>
                  <p className="text-gray-800">{form.getValues('previous_marriage_details')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}