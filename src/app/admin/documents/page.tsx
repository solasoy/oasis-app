import { AdminLayout } from '@/components/admin/admin-layout';

export default function DocumentsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Documents</h1>
          <p className="text-gray-600 mb-6">
            Customize documents and resources for participants. Create, upload, and manage documents that can be accessed by participants through the dashboard.
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
                  This page is under development. The document customization functionality will be implemented in a future update.
                </p>
              </div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Document Types</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Retreat checklist (items to bring)</li>
            <li>Preparation materials (reading/videos/podcasts)</li>
            <li>Oasis Garden Experience overview</li>
            <li>Retreat schedule</li>
            <li>Participant agreements</li>
          </ul>
          
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-4">Document Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-medium text-gray-800 mb-2">Upload Document</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex justify-center items-center bg-gray-50">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload functionality will be available in a future update
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="font-medium text-gray-800 mb-2">Document List</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-500 italic">Uploaded documents will be displayed here once implemented.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}