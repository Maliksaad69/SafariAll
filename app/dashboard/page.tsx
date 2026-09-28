import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// The dashboard is reserved for agencies (the operator portal).
// Travelers land on the homepage; admins go to the admin panel.
export default async function DashboardPage() {
  const session = await getSession();

  if (!session) redirect('/login');
  if (session.role === 'OPERATOR') redirect('/operator-portal');
  if (session.role === 'ADMIN') redirect('/admin');

  redirect('/tours');
}
