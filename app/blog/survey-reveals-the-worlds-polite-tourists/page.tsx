import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PoliteTouristsBlogPage() {
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
          <span className="text-[var(--ink)] font-medium">Polite Tourists Survey</span>
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
            News &amp; Insights
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[var(--brand-deep)] tracking-tight mb-6">
            Survey Reveals the World’s Polite Tourists
          </h1>

          <p className="text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed font-light mb-8">
            A new global travel survey suggests that travelers are increasingly prioritizing local etiquette, cultural respect, and smoother group interactions while planning trips abroad.
          </p>

          <div className="space-y-6 text-sm sm:text-base leading-relaxed text-[var(--ink)]/80">
            <p>
              Safari travel stands out because it depends on shared experiences: quiet hours, respectful wildlife viewing, and understanding the expectations of guides, staff, and local communities. In turn, operators are designing more flexible and more considerate itineraries.
            </p>
            <p>
              Travelers are also more likely to value authentic interactions, local food, and conservation-focused excursions. These trends are influencing how booking experiences are structured, from choice of accommodations to style of group transport.
            </p>
            <p>
              The result is a more thoughtful safari economy: one where cultural awareness and wildlife stewardship matter as much as the luxury or the checklist of famous animals seen.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
