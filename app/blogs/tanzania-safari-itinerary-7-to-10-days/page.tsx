import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TanzaniaSafariBlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-black/5 py-2.5 text-xs text-[var(--ink-muted)] bg-[var(--canvas)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">Home</Link>
          <span className="text-[var(--ink-muted)] opacity-60">/</span>
          <Link href="/blog" className="hover:text-[var(--brand)] transition-colors">Journal</Link>
          <span className="text-[var(--ink-muted)] opacity-60">/</span>
          <span className="text-[var(--ink)] font-medium">Tanzania Safari Itinerary</span>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="mb-6">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Journal
          </Link>
        </div>

        <article className="surface-card rounded-3xl border border-black/5 p-8 sm:p-12 shadow-sm">
          <div className="mb-4 inline-flex items-center rounded-full bg-[var(--brand-soft)] border border-[var(--brand-pale)] px-3 py-1 text-xs font-semibold text-[var(--brand-deep)]">
            Travel Guides
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[var(--brand-deep)] tracking-tight mb-6">
            Tanzania Safari Itinerary: How to Spend 7 to 10 Days
          </h1>

          <p className="text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed font-light mb-8">
            A 7–10 day Tanzania safari delivers the ideal mix of iconic wildlife, comfortable accommodation, and time to enjoy the landscapes without rushing from one park to the next.
          </p>

          <div className="space-y-6 text-sm sm:text-base leading-relaxed text-[var(--ink)]/80">
            <p>
              For most travelers, a classic itinerary starts in Arusha, then moves into the Serengeti for the famous Great Migration and sweeping grassland views. From there, a few nights in the Ngorongoro Crater region provide a high-density wildlife experience and exceptional scenery.
            </p>
            <p>
              If you have 8–10 days, you can comfortably add Tarangire National Park or a short stop in Zanzibar for a beach finish. This creates a balanced trip: safari by day, recovery and ocean time by the end.
            </p>
            <p>
              The best time to visit is typically during the dry season, when game viewing is easiest and the bush is easier to navigate. Planning with a local operator also helps ensure your route aligns with wildlife movement patterns and park access conditions.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
