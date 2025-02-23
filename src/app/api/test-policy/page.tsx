'use client';

import { useEffect, useState } from 'react';

export default function TestPolicyPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/test-policy')
      .then(res => res.json())
      .then(result => {
        setApplications(result.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleTestInsert = async () => {
    try {
      const response = await fetch('/api/test-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to insert test data');
      }

      // Refresh the data
      const getResponse = await fetch('/api/test-policy');
      const getResult = await getResponse.json();
      setApplications(getResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to insert test data');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Policy Results</h1>
      
      <button
        onClick={handleTestInsert}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Insert Test Data
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Retreat Date</th>
              <th className="border p-2">His Name</th>
              <th className="border p-2">Her Name</th>
              <th className="border p-2">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td className="border p-2">{app.id}</td>
                <td className="border p-2">{app.status}</td>
                <td className="border p-2">{app.retreat_date}</td>
                <td className="border p-2">
                  {`${app.his_name.first} ${app.his_name.last}`}
                </td>
                <td className="border p-2">
                  {`${app.her_name.first} ${app.her_name.last}`}
                </td>
                <td className="border p-2">
                  {new Date(app.submitted_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {applications.length === 0 && (
        <p className="mt-4 text-gray-500">No applications found</p>
      )}
    </div>
  );
} 