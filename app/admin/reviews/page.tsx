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
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#2C221E]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[#7A6A5C] font-bold">Admin</p>
          <h1 className="mt-2 text-3xl font-bold font-serif text-[#1C2826]">Review Moderation Console</h1>
        </div>

        <ReviewModerationQueue />
      </main>

      <Footer />
    </div>
  );
}
