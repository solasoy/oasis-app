"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading';
import { validateApplicationForm, ValidationError } from '@/lib/validation';

type FormStep = 'retreat' | 'personal' | 'background' | 'review';
type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

interface ApplicationFormData {
  // Retreat Selection
  retreatDate: string;
  
  // Personal Information
  hisName: { first: string; last: string };
  hisAge: '20s' | '30s' | '40s' | '50s' | '60s';
  herName: { first: string; last: string };
  herAge: '20s' | '30s' | '40s' | '50s' | '60s';
  
  // Contact Information
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal: string;
    country: string;
  };
  hisPhone: string;
  herPhone: string;
  hisEmail: string;
  herEmail: string;
  
  // Background Information
  children: string;
  previousMarriage: string;
  retreatReason: string;
  previousTherapy: string;
  isOCCMember: string;
  isChristFollower: string;
  weddingDate: string;
  livingArrangement: string;
}

export function ApplicationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>('retreat');
  const [formData, setFormData] = useState<ApplicationFormData>({
    retreatDate: 'March 5-9, 2025',
    hisName: { first: '', last: '' },
    hisAge: '20s',
    herName: { first: '', last: '' },
    herAge: '20s',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal: '',
      country: ''
    },
    hisPhone: '',
    herPhone: '',
    hisEmail: '',
    herEmail: '',
    children: '',
    previousMarriage: '',
    retreatReason: '',
    previousTherapy: '',
    isOCCMember: '',
    isChristFollower: '',
    weddingDate: '',
    livingArrangement: ''
  });
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const handleInputChange = (
    field: string,
    value: string | { first: string; last: string } | {
      line1: string;
      line2: string;
      city: string;
      state: string;
      postal: string;
      country: string;
    }
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (
    parent: keyof Pick<ApplicationFormData, 'hisName' | 'herName' | 'address'>,
    field: string,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const validateStep = (step: FormStep): boolean => {
    switch (step) {
      case 'retreat':
        return !!formData.retreatDate;
      case 'personal':
        return (
          !!formData.hisName.first && !!formData.hisName.last &&
          !!formData.herName.first && !!formData.herName.last &&
          !!formData.hisAge && !!formData.herAge &&
          !!formData.address.line1 && !!formData.address.city &&
          !!formData.address.state && !!formData.address.postal &&
          !!formData.hisPhone && !!formData.herPhone &&
          !!formData.hisEmail && !!formData.herEmail
        );
      case 'background':
        return (
          !!formData.isOCCMember && !!formData.isChristFollower &&
          !!formData.weddingDate && !!formData.livingArrangement &&
          !!formData.children && !!formData.previousMarriage &&
          !!formData.retreatReason && !!formData.previousTherapy
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (currentStep !== 'review') return;
    
    // Clear previous errors
    setValidationErrors([]);
    setErrorMessage('');
    
    // Validate form
    const errors = validateApplicationForm(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setErrorMessage('Please correct the errors before submitting.');
      return;
    }

    setSubmissionStatus('submitting');

    try {
      // Transform the data to match database column names
      const applicationData = {
        status: 'pending',
        retreat_date: formData.retreatDate,
        his_name: formData.hisName,
        his_age: formData.hisAge,
        his_phone: formData.hisPhone,
        his_email: formData.hisEmail,
        her_name: formData.herName,
        her_age: formData.herAge,
        her_phone: formData.herPhone,
        her_email: formData.herEmail,
        address: formData.address,
        is_occ_member: formData.isOCCMember,
        is_christ_follower: formData.isChristFollower,
        wedding_date: formData.weddingDate,
        living_arrangement: formData.livingArrangement,
        children: formData.children,
        previous_marriage: formData.previousMarriage,
        retreat_reason: formData.retreatReason,
        previous_therapy: formData.previousTherapy,
        submitted_at: new Date().toISOString()
      };

      console.log('Form data being sent:', JSON.stringify({
        status: 'pending',
        retreat_date: formData.retreatDate,
        his_name: formData.hisName,
        his_age: formData.hisAge,
        his_phone: formData.hisPhone,
        his_email: formData.hisEmail,
        her_name: formData.herName,
        her_age: formData.herAge,
        her_phone: formData.herPhone,
        her_email: formData.herEmail,
        address: formData.address,
        is_occ_member: formData.isOCCMember,
        is_christ_follower: formData.isChristFollower,
        wedding_date: formData.weddingDate,
        living_arrangement: formData.livingArrangement,
        children: formData.children,
        previous_marriage: formData.previousMarriage,
        retreat_reason: formData.retreatReason,
        previous_therapy: formData.previousTherapy,
        submitted_at: new Date().toISOString()
      }, null, 2));

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      console.log('Application submitted successfully:', data);

      setSubmissionStatus('success');
      router.push('/application/success');

    } catch (error) {
      console.error('Application submission error:', error);
      setSubmissionStatus('error');
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'Failed to submit application. Please try again.'
      );
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      alert('Please fill in all required fields before proceeding.');
      return;
    }

    const steps: FormStep[] = ['retreat', 'personal', 'background', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else if (currentStep === 'review') {
      handleSubmit();
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
      {/* Navigation Buttons - Moved to top */}
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
          type="button"
          onClick={async (e) => {
            e.preventDefault(); // Prevent any form submission
            console.log('Button clicked, current step:', currentStep);
            if (currentStep === 'review') {
              console.log('Attempting submission...');
              await handleSubmit();
            } else {
              handleNext();
            }
          }}
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

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        {currentStep === 'retreat' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900">Select Retreat Session</h2>
            <div className="mt-4">
              <select
                value={formData.retreatDate}
                onChange={(e) => handleInputChange('retreatDate', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="March 5-9, 2025">March 5-9, 2025</option>
              </select>
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
                    required
                    type="text"
                    value={formData.hisName.first}
                    onChange={(e) => handleNestedChange('hisName', 'first', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">Last Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.hisName.last}
                    onChange={(e) => handleNestedChange('hisName', 'last', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Age Range *</label>
                <select
                  required
                  value={formData.hisAge}
                  onChange={(e) => handleInputChange('hisAge', e.target.value)}
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
                    required
                    type="text"
                    value={formData.herName.first}
                    onChange={(e) => handleNestedChange('herName', 'first', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">Last Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.herName.last}
                    onChange={(e) => handleNestedChange('herName', 'last', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Age Range *</label>
                <select
                  required
                  value={formData.herAge}
                  onChange={(e) => handleInputChange('herAge', e.target.value)}
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
                  required
                  type="text"
                  value={formData.address.line1}
                  onChange={(e) => handleNestedChange('address', 'line1', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Line 2</label>
                <input
                  type="text"
                  value={formData.address.line2}
                  onChange={(e) => handleNestedChange('address', 'line2', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700">City *</label>
                  <input
                    required
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">State *</label>
                  <input
                    required
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700">Postal/Zip Code *</label>
                  <input
                    required
                    type="text"
                    value={formData.address.postal}
                    onChange={(e) => handleNestedChange('address', 'postal', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700">Country *</label>
                  <select
                    required
                    value={formData.address.country}
                    onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
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
                  required
                  type="tel"
                  value={formData.hisPhone}
                  onChange={(e) => handleInputChange('hisPhone', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Her Phone Number *</label>
                <input
                  required
                  type="tel"
                  value={formData.herPhone}
                  onChange={(e) => handleInputChange('herPhone', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">His Email *</label>
                <input
                  required
                  type="email"
                  value={formData.hisEmail}
                  onChange={(e) => handleInputChange('hisEmail', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">Her Email *</label>
                <input
                  required
                  type="email"
                  value={formData.herEmail}
                  onChange={(e) => handleInputChange('herEmail', e.target.value)}
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
                required
                value={formData.isOCCMember}
                onChange={(e) => handleInputChange('isOCCMember', e.target.value)}
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
                required
                value={formData.isChristFollower}
                onChange={(e) => handleInputChange('isChristFollower', e.target.value)}
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
                required
                type="date"
                value={formData.weddingDate}
                onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Living Arrangement */}
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Are you living together or separated? *
              </label>
              <textarea
                required
                value={formData.livingArrangement}
                onChange={(e) => handleInputChange('livingArrangement', e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Children */}
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Do you have children? If so, what are their ages? *
              </label>
              <textarea
                required
                value={formData.children}
                onChange={(e) => handleInputChange('children', e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Previous Marriage */}
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Were either or both of you married before? If so, for how long? *
              </label>
              <textarea
                required
                value={formData.previousMarriage}
                onChange={(e) => handleInputChange('previousMarriage', e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Retreat Reason */}
            <div>
              <label className="block text-sm font-bold text-gray-700">
                What issues bring you to request a spot at the marriage intensive retreat? *
              </label>
              <textarea
                required
                value={formData.retreatReason}
                onChange={(e) => handleInputChange('retreatReason', e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Previous Therapy */}
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Are you currently or have you previously had couple's therapy? *
              </label>
              <textarea
                required
                value={formData.previousTherapy}
                onChange={(e) => handleInputChange('previousTherapy', e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
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
              <p className="text-gray-600">{formData.retreatDate}</p>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-gray-700">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-bold text-sm text-gray-600">His Name</p>
                  <p className="text-gray-800">{formData.hisName.first} {formData.hisName.last}</p>
                  <p className="font-bold text-sm text-gray-600 mt-2">His Age</p>
                  <p className="text-gray-800">{formData.hisAge}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Her Name</p>
                  <p className="text-gray-800">{formData.herName.first} {formData.herName.last}</p>
                  <p className="font-bold text-sm text-gray-600 mt-2">Her Age</p>
                  <p className="text-gray-800">{formData.herAge}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-gray-700">Contact Information</h3>
              <div>
                <p className="font-bold text-sm text-gray-600">Address</p>
                <p className="text-gray-800">{formData.address.line1}</p>
                {formData.address.line2 && <p className="text-gray-800">{formData.address.line2}</p>}
                <p className="text-gray-800">
                  {formData.address.city}, {formData.address.state} {formData.address.postal}
                </p>
                <p className="text-gray-800">{formData.address.country}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="font-bold text-sm text-gray-600">His Contact</p>
                  <p className="text-gray-800">{formData.hisPhone}</p>
                  <p className="text-gray-800">{formData.hisEmail}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Her Contact</p>
                  <p className="text-gray-800">{formData.herPhone}</p>
                  <p className="text-gray-800">{formData.herEmail}</p>
                </div>
              </div>
            </div>

            {/* Background Information */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-gray-700">Background Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-sm text-gray-600">Church Membership</p>
                  <p className="text-gray-800">{formData.isOCCMember}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Faith Background</p>
                  <p className="text-gray-800">{formData.isChristFollower}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Wedding Date</p>
                  <p className="text-gray-800">{formData.weddingDate}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Living Arrangement</p>
                  <p className="text-gray-800">{formData.livingArrangement}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Children</p>
                  <p className="text-gray-800">{formData.children}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Previous Marriage</p>
                  <p className="text-gray-800">{formData.previousMarriage}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Reason for Retreat</p>
                  <p className="text-gray-800">{formData.retreatReason}</p>
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-600">Previous Therapy</p>
                  <p className="text-gray-800">{formData.previousTherapy}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
} 