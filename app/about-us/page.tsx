import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, Compass, ShieldCheck, Users, BadgeCheck } from 'lucide-react';

export default function AboutUsPage() {
  const pillars = [
    {
      title: 'Direct operator access',
      text: 'We connect travelers straight to verified African safari operators — no hidden middlemen, no inflated markups.',
      icon: Users,
    },
    {
      title: 'Verified local specialists',
      text: 'Every operator in our network is checked for licensing, reputation, and experience across East, Southern, and Central Africa.',
      icon: ShieldCheck,
    },
    {
      title: 'Tailor-made safari planning',
      text: 'From luxury lodges to budget camping, we make it easy to compare, choose, and request a quote that fits your travel style.',
      icon: BadgeCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#2d1a12]">
      <Navbar />

      <main className="mx-auto max-w-[1230px] px-4 py-10 sm:px-6 lg:px-0">
        <div className="mb-8 bg-[#efe7db] border border-[#e4dbc9] rounded-[18px] px-6 py-6 shadow-sm">
          <div className="text-[12px] text-[#6b5130] uppercase tracking-[0.12em] font-semibold mb-3">
            You are here:{' '}
            <Link href="/" className="text-[var(--brand-ink)] hover:underline">Home</Link>
            {' > '}
            <span className="text-[#2d1a12]">About Us</span>
          </div>
          <h1 className="text-[38px] md:text-[52px] leading-none text-[#1d1a18] tracking-[-0.05em]" style={{ fontFamily: 'Georgia, serif' }}>
            About SafariRequest
          </h1>
        </div>

        <section className="relative overflow-hidden rounded-[18px] border border-[#d8d1c8] bg-[#1f1712] shadow-[0_12px_28px_rgba(10,8,6,0.25)]">
          <div className="absolute inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)]" />
          <div className="relative px-6 py-12 text-white md:px-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f5d27a]/30 bg-[#f5d27a]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#f9d98a]">
              <Compass className="h-3.5 w-3.5" />
              About SafariRequest
            </div>
            <h1 className="max-w-[700px] text-3xl font-bold tracking-[-0.04em] text-white md:text-5xl" style={{ fontFamily: 'Georgia, serif' }}>
              A smarter way to compare African safari holidays
            </h1>
            <p className="mt-4 max-w-[720px] text-sm leading-relaxed text-white">
              SafariRequest brings together the best safari operators, destinations, and itinerary options in one clear marketplace, making it easier to compare, discover, and book authentic African adventures.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/tours" className="rounded-md bg-[#f4c45b] px-5 py-2.5 text-sm font-bold text-[#2d1a12] transition hover:brightness-105">
                Explore Safaris
              </Link>
              <Link href="/operators" className="rounded-md border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
                Meet Operators
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          {pillars.map(({ title, text, icon: Icon }) => (
            <article key={title} className="rounded-[16px] border border-[#d8d1c8] bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4e7c5] text-[#b58927]">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-[1.65rem] font-bold leading-tight text-[#1d1a18]" style={{ fontFamily: 'Georgia, serif' }}>{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#5a4e46]">{text}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-[16px] border border-[#d8d1c8] bg-white p-7 shadow-sm">
          <h2 className="text-[2rem] font-bold tracking-[-0.04em] text-[#1e1a18]" style={{ fontFamily: 'Georgia, serif' }}>Why travelers use SafariRequest</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-sm leading-relaxed text-[#5a4e46]">
                Travelers use our marketplace to compare luxury lodges, mobile camps, private-guided itineraries, and conservation-led experiences without chasing dozens of operator websites.
              </p>
            </div>
            <div>
              <p className="text-sm leading-relaxed text-[#5a4e46]">
                Whether you want a classic Tanzania safari, a Botswana delta adventure, or a gorilla trek in Uganda, SafariRequest helps you filter by price, style, duration, and destination before requesting a quote.
              </p>
            </div>
          </div>
          <div className="mt-8 flex justify-start">
            <Link href="/quote/request" className="inline-flex items-center gap-2 rounded-md bg-[#2e6a64] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#275a54]">
              Request a quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
