import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-body)]">
      <Navbar />

      <main className="mx-auto max-w-[1230px] px-4 py-10 sm:px-6 lg:px-0">
        <section className="rounded-[18px] border border-[var(--border-strong)] bg-[var(--surface-card)] p-7 shadow-sm md:p-10">
          <div className="mb-6 inline-flex items-center rounded-full bg-[var(--gold-soft)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--gold)]">
            Contact us
          </div>
          <h1 className="text-[2.5rem] font-bold tracking-[-0.04em] text-[var(--ink)] font-display">Let's plan your next safari</h1>
          <p className="mt-3 max-w-[700px] text-sm leading-relaxed text-[var(--ink-secondary)]">
            Tell us where you want to go, when you'd like to travel, and how you prefer to experience Africa. We'll help connect you with the most suitable safari specialists for your trip.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface-raised)] p-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold-soft)] text-[var(--gold)]"><Mail className="h-4 w-4" /></div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-muted)]">Email</div>
                    <a href="mailto:hello@safaribuilt.com" className="mt-1 block text-sm font-semibold text-[var(--ink)]">hello@safaribuilt.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold-soft)] text-[var(--gold)]"><Phone className="h-4 w-4" /></div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-muted)]">Phone</div>
                    <a href="tel:+255754200120" className="mt-1 block text-sm font-semibold text-[var(--ink)]">+255 754 200 120</a>
                  </div>
                </div>
                <div className="flex items-start gap-3 md:col-span-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold-soft)] text-[var(--gold)]"><MapPin className="h-4 w-4" /></div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-muted)]">Location</div>
                    <p className="mt-1 text-sm font-semibold text-[var(--ink)]">Arusha, Tanzania</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[14px] border border-[var(--border)] bg-[var(--dark)] p-5 text-white">
              <h2 className="text-[1.4rem] font-bold font-display">Need a quote fast?</h2>
              <p className="mt-3 text-sm leading-relaxed text-white">
                Our team can help tailor the right itinerary for your dream safari in a few hours.
              </p>
              <Link href="/quote/request" className="btn btn-primary mt-5 inline-flex items-center gap-2">
                Request a quote
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
