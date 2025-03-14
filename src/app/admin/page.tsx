import { AdminTile } from '@/components/admin/admin-tile';
import { AdminLayout } from '@/components/admin/admin-layout';

export default function AdminPage() {
  // Icons for the admin tiles
  const ApplicationsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  const IntakeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );

  const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  const CustomizationsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );

  const ReportsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900">OCC Oasis Admin Portal</h1>
          <p className="mt-2 text-lg text-gray-600">Manage applications, participants, and retreat resources</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminTile
            title="Applications"
            description="View and manage retreat applications"
            href="/admin/applications"
            icon={<ApplicationsIcon />}
          />
          
          <AdminTile
            title="Intake"
            description="Create participant profiles for approved applications"
            href="/admin/intake"
            icon={<IntakeIcon />}
          />
          
          <AdminTile
            title="Email"
            description="Customize and send emails to participants"
            href="/admin/email"
            icon={<EmailIcon />}
          />
          
          <AdminTile
            title="Customizations"
            description="Customize documents and resources for participants"
            href="/admin/customizations"
            icon={<CustomizationsIcon />}
          />
          
          <AdminTile
            title="Reports"
            description="Generate reports from application and participant data"
            href="/admin/reports"
            icon={<ReportsIcon />}
          />
        </div>
      </div>
    </AdminLayout>
  );
}