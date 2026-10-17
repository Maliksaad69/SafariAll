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
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-black/5 py-2.5 text-xs text-[var(--ink-muted)] bg-[var(--canvas)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">Home</Link>
          <span className="text-[var(--ink-muted)] opacity-60">/</span>
          <Link href="/reviews" className="hover:text-[var(--brand)] transition-colors">Experts</Link>
          <span className="text-[var(--ink-muted)] opacity-60">/</span>
          <span className="text-[var(--ink)] font-medium">{expert.name}</span>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="surface-card rounded-3xl border border-black/5 p-8 sm:p-12 shadow-sm flex flex-col md:flex-row gap-8 items-start">
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={expert.image}
              alt={expert.name}
              className="h-44 w-44 rounded-2xl object-cover border border-black/10 shadow-md"
            />
          </div>

          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] border border-[var(--brand-pale)] px-3.5 py-1 text-xs font-semibold text-[var(--brand-deep)]">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>Safari Expert · {expert.reviewCount} Reviews</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-[var(--brand-deep)] tracking-tight">
              {expert.name}
            </h1>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">{expert.country}</p>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--ink)]/80">{expert.biography}</p>

            <div className="pt-4">
              <Link
                href="/reviews"
                className="btn btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold shadow-sm"
              >
                <span>Read Traveler Reviews</span>
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
