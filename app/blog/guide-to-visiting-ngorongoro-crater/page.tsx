import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NgorongoroBlogPage() {
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
          <span className="text-[var(--ink)] font-medium">Ngorongoro Crater</span>
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
            Parks &amp; Wildlife
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[var(--brand-deep)] tracking-tight mb-6">
            Guide to Visiting Ngorongoro Crater
          </h1>

          <p className="text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed font-light mb-8">
            Ngorongoro Crater is one of the premier wildlife sanctuaries in East Africa, offering extraordinarily high densities of game on a collapsed volcanic caldera floor.
          </p>

          <div className="space-y-6 text-sm sm:text-base leading-relaxed text-[var(--ink)]/80">
            <p>
              A full day in the crater usually starts early, with a guided drive down onto the crater floor before the heat rises. The road network is fairly easy to navigate, though it is best to keep your expectations flexible as wildlife movements can shift each day.
            </p>
            <p>
              Most visitors focus on the central areas where the highest concentration of rhinos, elephants, buffalo, and lion activity can be seen. Sunrises and late afternoons are often the best times for spotting predators, while midday still offers rich grazing and birdlife.
            </p>
            <p>
              It is worth planning ahead for permits, timing, and whether you want a private vehicle or a shared safari transfer. A well-paced day with an experienced guide is often the difference between a rushed drive and a truly memorable experience.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
