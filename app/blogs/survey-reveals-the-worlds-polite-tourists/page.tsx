import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PoliteTouristsBlogPage() {
  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#2d1a12]">
      <Navbar />

      <main className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 lg:px-0">
        <div className="mb-5">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2e6a64]">
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>
        </div>

        <article className="rounded-[18px] border border-[#d8d1c8] bg-white p-7 shadow-sm md:p-10">
          <div className="mb-4 inline-flex items-center rounded-full bg-[#f4e7c5] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#b58927]">
            News & Insights
          </div>
          <h1 className="text-[2.5rem] font-bold tracking-[-0.04em] text-[#1e1a18]" style={{ fontFamily: 'Georgia, serif' }}>
            Survey Reveals the World’s Polite Tourists
          </h1>

          <p className="mt-5 text-sm leading-relaxed text-[#5a4e46]">
            A new global travel survey suggests that travelers are increasingly prioritizing local etiquette, cultural respect, and smoother group interactions while planning trips abroad.
          </p>

          <div className="mt-8 space-y-5 text-sm leading-relaxed text-[#5a4e46]">
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
