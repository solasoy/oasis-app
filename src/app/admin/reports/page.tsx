import { AdminLayout } from '@/components/admin/admin-layout';

export default function ReportsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Reports</h1>
          <p className="text-gray-600 mb-6">
            Generate reports from application and participant data. View, print, and export reports to help manage the retreat and track participant information.
          </p>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This page is under development. The reporting functionality will be implemented in a future update.
                </p>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-gray-800 mb-1">Application Data</h3>
              <p className="text-sm text-gray-600">View application data for specific retreat cohorts</p>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-gray-800 mb-1">Intake Form Data</h3>
              <p className="text-sm text-gray-600">View intake information for approved participants</p>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-gray-800 mb-1">Food Preferences</h3>
              <p className="text-sm text-gray-600">View dietary requirements and preferences</p>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer">
              <h3 className="font-medium text-gray-800 mb-1">Checklist Status</h3>
              <p className="text-sm text-gray-600">Track completion of participant checklist items</p>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Custom SQL Query</h2>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="mb-4">
              <label htmlFor="sql-query" className="block text-sm font-medium text-gray-700 mb-1">
                SQL Query
              </label>
              <textarea
                id="sql-query"
                rows={4}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="SELECT * FROM applications WHERE status = 'approved'"
                disabled
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 opacity-50 cursor-not-allowed"
                disabled
              >
                Run Query
              </button>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">Report Results</h2>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <p className="text-gray-500 italic text-center py-8">
              Report results will be displayed here once a report is generated.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}