import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Attendee Dashboard</h1>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Food Preferences */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Food Preferences</h2>
            <p className="mt-2 text-sm text-gray-500">
              Let us know about your dietary requirements and preferences.
            </p>
            <div className="mt-4">
              <Link
                href="/dashboard/food-preferences"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Update Preferences
              </Link>
            </div>
          </div>
        </div>

        {/* Packing List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Packing List</h2>
            <p className="mt-2 text-sm text-gray-500">
              View the recommended items to bring to the retreat.
            </p>
            <div className="mt-4">
              <Link
                href="/dashboard/packing-list"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                View List
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">Important Documents</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Retreat Agreement</h3>
                <p className="text-sm text-gray-500">Current version of your signed agreement</p>
              </div>
              <Link
                href="/dashboard/agreement"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
              >
                View Agreement
              </Link>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Payment Status</h3>
                <p className="text-sm text-gray-500">Track your payments and upcoming dues</p>
              </div>
              <Link
                href="/dashboard/payments"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
              >
                View Status
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Communications Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">Communications</h2>
          <p className="mt-2 text-sm text-gray-500">
            Recent updates and messages from the retreat organizers.
          </p>
          {/* TODO: Add communications list */}
          <div className="mt-4 text-sm text-gray-500 italic">
            No messages at this time.
          </div>
        </div>
      </div>
    </div>
  );
}