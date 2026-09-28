import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TanzaniaSafariBlogPage() {
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
            Travel Guides
          </div>
          <h1 className="text-[2.5rem] font-bold tracking-[-0.04em] text-[#1e1a18]" style={{ fontFamily: 'Georgia, serif' }}>
            Tanzania Safari Itinerary: How to Spend 7 to 10 Days
          </h1>

          <p className="mt-5 text-sm leading-relaxed text-[#5a4e46]">
            A 7–10 day Tanzania safari delivers the ideal mix of iconic wildlife, comfortable accommodation, and time to enjoy the landscapes without rushing from one park to the next.
          </p>

          <div className="mt-8 space-y-5 text-sm leading-relaxed text-[#5a4e46]">
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
