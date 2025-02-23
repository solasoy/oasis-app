import { ApplicationForm } from '@/components/forms/application-form';

export default function ApplicationPage() {
  return (
    <div className="p-8">
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