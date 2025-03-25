import Link from 'next/link';

interface DashboardCardProps {
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
  icon?: React.ReactNode;
}

export function DashboardCard({
  title,
  description,
  linkText,
  linkHref,
  icon
}: DashboardCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          {icon && <div className="flex-shrink-0 mr-3">{icon}</div>}
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <div className="mt-3 text-sm text-gray-500">
          <p>{description}</p>
        </div>
        <div className="mt-5">
          <Link
            href={linkHref}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {linkText}
          </Link>
        </div>
      </div>
    </div>
  );
}