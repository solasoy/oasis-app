import { AdminLayout } from '@/components/admin/admin-layout';

export default function EmailPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Management</h1>
          <p className="text-gray-600 mb-6">
            Customize and send emails to participants. Create email templates, schedule automated emails, and manage communication with retreat participants.
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
                  This page is under development. The email management functionality will be implemented in a future update.
                </p>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Email Features</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Create and edit email templates with boilerplate information</li>
            <li>Schedule automated emails for specific dates</li>
            <li>Send welcome emails to new participants</li>
            <li>Send reminder emails for upcoming retreats</li>
            <li>Forward emails to other email addresses</li>
            <li>Track email delivery and open rates</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">Email Templates</h2>
          <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
            <p className="text-gray-500 italic">Email templates will be displayed here once implemented.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}