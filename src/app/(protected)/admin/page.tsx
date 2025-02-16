import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      
      {/* Retreat Configuration */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">Retreat Configuration</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/admin/retreat-settings"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
            >
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Retreat Settings</p>
                <p className="text-sm text-gray-500">Manage dates, pricing, and location</p>
              </div>
            </Link>

            <Link
              href="/admin/agreement-editor"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
            >
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Agreement Editor</p>
                <p className="text-sm text-gray-500">Manage agreement templates</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Communications */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">Communications</h2>
          <div className="mt-4 space-y-4">
            <Link
              href="/admin/communications"
              className="block relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">Email Management</p>
                <p className="text-sm text-gray-500">Create and schedule communications</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">Data Management</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/admin/couples"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
            >
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Couples</p>
                <p className="text-sm text-gray-500">View and manage applications</p>
              </div>
            </Link>

            <Link
              href="/admin/food-preferences"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
            >
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Food Preferences</p>
                <p className="text-sm text-gray-500">View dietary requirements</p>
              </div>
            </Link>

            <Link
              href="/admin/payments"
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
            >
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Payments</p>
                <p className="text-sm text-gray-500">Track payments and balances</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}