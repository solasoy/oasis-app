'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

interface Admin {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export default function AdminSupportPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Fetch all admins on page load
  useEffect(() => {
    async function fetchAdmins() {
      try {
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .order('created_at', { ascending: false });

        if (adminError) {
          throw adminError;
        }

        setAdmins(adminData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch admin accounts');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAdmins();
  }, [supabase]);

  // Add a new admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Check if admin already exists
      const { data: existingAdmin } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();

      if (existingAdmin) {
        setError('An admin with this email already exists');
        return;
      }

      // Add the new admin
      const { data: newAdmin, error: insertError } = await supabase
        .from('admins')
        .insert([
          {
            email,
            name,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Update the admins list
      setAdmins([newAdmin, ...admins]);
      setSuccess(`Admin ${name} (${email}) added successfully`);
      
      // Clear the form
      setEmail('');
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add admin');
    } finally {
      setLoading(false);
    }
  };

  // Remove an admin
  const handleRemoveAdmin = async (adminId: number, adminEmail: string) => {
    // Prevent removing yourself
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email === adminEmail) {
      setError("You cannot remove your own admin account");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: deleteError } = await supabase
        .from('admins')
        .delete()
        .eq('id', adminId);

      if (deleteError) {
        throw deleteError;
      }

      // Update the admins list
      setAdmins(admins.filter(admin => admin.id !== adminId));
      setSuccess(`Admin ${adminEmail} removed successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">Admin Support</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            {/* Add Admin Form */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Add New Admin</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Add a new administrator to the system
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                {error && (
                  <div className="rounded-md bg-red-50 p-4 mb-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                )}
                {success && (
                  <div className="rounded-md bg-green-50 p-4 mb-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">{success}</h3>
                      </div>
                    </div>
                  </div>
                )}
                <form onSubmit={handleAddAdmin} className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Admin'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Admin List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-medium text-gray-900">Admin Accounts</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage existing administrator accounts
                </p>
              </div>
              <div className="border-t border-gray-200">
                {isLoading ? (
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <p className="text-gray-500">Loading admin accounts...</p>
                  </div>
                ) : admins.length === 0 ? (
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <p className="text-gray-500">No admin accounts found</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {admins.map((admin) => (
                      <li key={admin.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-indigo-600 truncate">{admin.email}</p>
                            <p className="text-sm text-gray-500">{admin.name}</p>
                            <p className="text-xs text-gray-400">
                              Added on {new Date(admin.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <button
                              onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                              disabled={loading}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}