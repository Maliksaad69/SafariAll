import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReviewModerationQueue from '@/components/ReviewModerationQueue';
import { getSession } from '@/lib/auth';

export default async function AdminReviewsPage() {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="mb-8">
          <span className="text-xs uppercase tracking-wider text-[var(--brand)] font-bold">Admin Console</span>
          <h1 className="mt-1 text-3xl font-bold font-display text-[var(--brand-deep)]">Review Moderation Console</h1>
        </div>

        <ReviewModerationQueue />
      </main>

      <Footer />
    </div>
  );
}
