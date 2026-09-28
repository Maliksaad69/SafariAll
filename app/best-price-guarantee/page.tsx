import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShieldCheck, BadgePercent, ArrowRight } from 'lucide-react';

export default function BestPriceGuaranteePage() {
  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#2d1a12]">
      <Navbar />

      <main className="mx-auto max-w-[1230px] px-4 py-10 sm:px-6 lg:px-0">
        <section className="rounded-[18px] border border-[#d8d1c8] bg-white p-7 shadow-sm md:p-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#f4e7c5] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#b58927]">
            <BadgePercent className="h-3.5 w-3.5" />
            Best price guarantee
          </div>
          <h1 className="text-[2.5rem] font-bold tracking-[-0.04em] text-[#1e1a18]" style={{ fontFamily: 'Georgia, serif' }}>Find the best value on your safari</h1>
          <p className="mt-3 max-w-[720px] text-sm leading-relaxed text-[#5a4e46]">
            We work directly with verified local safari companies so you can compare packages transparently and avoid inflated commission fees. If you find a lower published price for the same itinerary, let us know and we’ll review it.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              'Transparent pricing from vetted operators',
              'No hidden commission layers or inflated booking fees',
              'Responsive support when you want to negotiate or compare alternatives',
            ].map((item) => (
              <div key={item} className="rounded-[14px] border border-[#e8e0d8] bg-[#faf7f2] p-5 text-sm text-[#4a3d36]">
                <ShieldCheck className="mb-3 h-5 w-5 text-[#b58927]" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[14px] border border-[#d8d1c8] bg-[#1f1712] p-6 text-white">
            <p className="text-sm leading-relaxed text-white">
              Not every safari quote is identical. Our goal is to help you compare value, not just cost, so you can choose trips that balance experience, style, accommodation, and logistics.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/tours" className="inline-flex items-center gap-2 rounded-md bg-[#f4c45b] px-5 py-2.5 text-sm font-bold text-[#2d1a12] hover:brightness-105">
                Compare safaris
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/quote/request" className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10">
                Ask for a tailored quote
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
