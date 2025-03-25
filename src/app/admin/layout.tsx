import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AdminLayout as AdminLayoutComponent } from '@/components/admin/admin-layout';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // DEVELOPMENT MODE: Complete bypass of all authentication
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 DEV AUTH: Complete bypass of authentication in admin layout');
    return (
      <AdminLayoutComponent>
        {children}
      </AdminLayoutComponent>
    );
  }
  
  // We don't need to check for the login page here
  // because we have a separate layout for the login page
  // that doesn't inherit from this layout
  
  const supabase = createServerComponentClient({ cookies });
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  try {
    // Check if user is in the admins table
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id')
      .eq('email', user.email)
      .single();

    if (error || !admin) {
      redirect('/dashboard');
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    redirect('/dashboard');
  }

  return (
    <AdminLayoutComponent>
      {children}
    </AdminLayoutComponent>
  );
}