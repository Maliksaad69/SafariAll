import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, ChevronRight } from 'lucide-react';
import { safariExperts } from '@/lib/site-data';

export const dynamic = 'force-dynamic';

interface ExpertPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExpertPage({ params }: ExpertPageProps) {
  const { id } = await params;
  const expert = safariExperts.find((e) => e.id === id);

  if (!expert) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f3ee] text-[#2d1a12]">
      <Navbar />

      <main className="mx-auto max-w-[1230px] w-full px-4 py-10 sm:px-6">
        <div className="mb-6 text-[12px] text-[#6b5130] uppercase tracking-[0.12em] font-semibold">
          You are here:{' '}
          <Link href="/" className="text-[#0070c0] hover:underline">Home</Link>
          {' > '}
          <Link href="/reviews" className="text-[#0070c0] hover:underline">Experts</Link>
          {' > '}
          <span className="text-[#2d1a12]">{expert.name}</span>
        </div>

        <div className="rounded-[18px] border border-[#e8e0d8] bg-white p-8 shadow-sm md:p-10 flex flex-col md:flex-row gap-8">
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={expert.image}
              alt={expert.name}
              className="h-[160px] w-[160px] rounded-2xl object-cover border border-[#e8e0d8] shadow-md"
            />
          </div>

          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f4e7c5] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#b58927]">
              <Star className="h-3.5 w-3.5 fill-current" />
              Safari Expert · {expert.reviewCount} Reviews
            </div>
            <h1 className="text-[2.4rem] font-bold leading-tight tracking-[-0.04em] text-[#1e1a18]" style={{ fontFamily: 'Georgia, serif' }}>
              {expert.name}
            </h1>
            <p className="text-[13px] font-semibold uppercase tracking-wide text-[#7a6a5c]">{expert.country}</p>
            <p className="max-w-2xl text-sm leading-relaxed text-[#5a4e46]">{expert.biography}</p>

            <div className="pt-4">
              <Link
                href="/reviews"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#C85A17] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#a6470e]"
              >
                Read Traveler Reviews
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
