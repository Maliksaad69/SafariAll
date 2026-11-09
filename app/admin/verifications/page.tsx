import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminVerificationsRedirect() {
  const session = await getSession();

  // Hide admin panel from public/unauthorized access with 404
  if (!session || session.role !== 'ADMIN') {
    notFound();
  }

  redirect('/admin');
}
