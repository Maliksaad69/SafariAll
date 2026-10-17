import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShieldCheck, BadgePercent, ArrowRight } from 'lucide-react';

export default function BestPriceGuaranteePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-black/5 py-2.5 text-xs text-[var(--ink-muted)] bg-[var(--canvas)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">Home</Link>
          <span className="text-[var(--ink-muted)] opacity-60">/</span>
          <span className="text-[var(--ink)] font-medium">Best Price Guarantee</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <section className="surface-card rounded-3xl border border-black/5 p-8 sm:p-12 shadow-sm">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] border border-[var(--brand-pale)] px-3.5 py-1 text-xs font-semibold text-[var(--brand-deep)]">
            <BadgePercent className="h-3.5 w-3.5 text-[var(--brand)]" />
            <span>Best Price Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[var(--brand-deep)] tracking-tight mb-4">
            Find the best value on your African safari
          </h1>
          <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-[var(--ink-muted)] mb-10">
            We work directly with verified local safari companies so you can compare packages transparently and avoid inflated commission fees. If you find a lower published price for the exact same itinerary, let us know and we’ll review it.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {[
              {
                title: 'Transparent Local Rates',
                desc: 'Direct pricing from vetted operators on the ground with zero artificial markups.',
              },
              {
                title: 'No Hidden Surcharges',
                desc: 'Clear itemized breakdowns of park conservation fees, transfers, and taxes.',
              },
              {
                title: 'Bespoke Price Matching',
                desc: 'Responsive support when comparing quotes to ensure equal lodging and guide quality.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-black/5 bg-[var(--sand)]/50 p-6 shadow-sm hover:border-[var(--brand)]/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="text-base font-bold font-display text-[var(--brand-deep)] mb-1.5">
                  {item.title}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-[var(--brand-deep)] p-8 text-white border border-white/10 shadow-lg">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold font-display text-white mb-2">
                Comparing True Value, Not Just Sticker Price
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-white/85 font-light mb-6">
                Not every safari quote is identical. Vehicle quality, camp concessions, guide experience, and fly-in vs. drive-in logistics significantly affect your safari experience. Our marketplace helps you weigh true value.
              </p>
              <div className="flex flex-wrap gap-3.5">
                <Link href="/tours" className="btn btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-sm">
                  <span>Compare Safaris</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/quote/request" className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl text-sm font-semibold backdrop-blur-md transition-all">
                  Request a Tailored Quote
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
