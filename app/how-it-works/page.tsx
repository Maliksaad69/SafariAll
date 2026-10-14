import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Compass, ShieldCheck, Ticket } from 'lucide-react';

const steps = [
  {
    title: 'Search and compare',
    text: 'Start with your dream destination, travel style, and budget to compare safari tours across Africa.',
    icon: Compass,
  },
  {
    title: 'Shortlist trusted operators',
    text: 'Review verified local specialists with real customer feedback, pricing transparency, and trip experience.',
    icon: ShieldCheck,
  },
  {
    title: 'Book with confidence',
    text: 'Request a quote, check inclusions, and finalize your itinerary directly with the operator that matches your needs.',
    icon: Ticket,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#2d1a12]">
      <Navbar />

      <main className="mx-auto max-w-[1230px] px-4 py-10 sm:px-6 lg:px-0">
        <section className="rounded-[18px] border border-[#d8d1c8] bg-[#1f1712] p-7 shadow-[0_12px_28px_rgba(10,8,6,0.25)] md:p-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f5d27a]/30 bg-[#f5d27a]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#f9d98a]">
            <Compass className="h-3.5 w-3.5" />
            How it works
          </div>
          <h1 className="text-[2.5rem] font-bold tracking-[-0.04em] text-white" style={{ fontFamily: 'Georgia, serif' }}>
            Planning your safari should be simple and transparent
          </h1>
          <p className="mt-3 max-w-[700px] text-sm leading-relaxed text-white">
            SafariRequest helps travelers compare trusted operators, check safari packages, and request tailored quotes without the hassle of confusing pricing or hidden costs.
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="rounded-[16px] border border-[#d8d1c8] bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4e7c5] text-[#b58927]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7a6a5c]">Step {index + 1}</div>
                <h2 className="mt-2 text-[1.7rem] font-bold leading-tight text-[#1d1a18]" style={{ fontFamily: 'Georgia, serif' }}>{step.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-[#5a4e46]">{step.text}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-8 rounded-[16px] border border-[#d8d1c8] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 text-[#b58927]">
            <CheckCircle2 className="h-5 w-5" />
            <h2 className="text-[1.8rem] font-bold text-[#1d1a18]" style={{ fontFamily: 'Georgia, serif' }}>Why travelers choose SafariRequest</h2>
          </div>
          <ul className="space-y-3 text-sm text-[#5a4e46]">
            <li>• Compare local operators, safari styles, and park options on one marketplace.</li>
            <li>• Save time with a clear breakdown of accommodation, flights, park fees, and inclusions.</li>
            <li>• Ask for tailored quotes directly to match your budget and travel dates.</li>
          </ul>
          <div className="mt-6">
            <Link href="/quote/request" className="inline-flex items-center gap-2 rounded-md bg-[#f4c45b] px-5 py-2.5 text-sm font-bold text-[#2d1a12] transition hover:brightness-105">
              Start your quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
