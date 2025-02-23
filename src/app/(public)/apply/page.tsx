import { ApplicationForm } from '@/components/forms/application-form';

export default function ApplicationPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">Retreat Application</h1>
          <p className="mt-2 text-gray-500">
            Complete your application for the OCC Oasis Garden Experience.
          </p>
          
          <div className="mt-4 bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-700">
              The application process includes:
            </p>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Personal information for both partners</li>
              <li>The reasons you wish to participate in this retreat</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">
              After submitting your application, you will receive further instructions
              via email regarding the next steps in the process.
            </p>
          </div>

          <div className="mt-6">
            <ApplicationForm />
          </div>
        </div>
      </div>
    </div>
  );
}