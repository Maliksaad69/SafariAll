import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#2d1a12]">
      <Navbar />

      <main className="mx-auto max-w-[1230px] px-4 py-10 sm:px-6 lg:px-0">
        <section className="rounded-[18px] border border-[#d8d1c8] bg-white p-7 shadow-sm md:p-10">
          <div className="mb-6 inline-flex items-center rounded-full bg-[#f4e7c5] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#b58927]">
            Contact us
          </div>
          <h1 className="text-[2.5rem] font-bold tracking-[-0.04em] text-[#1e1a18]" style={{ fontFamily: 'Georgia, serif' }}>Let’s plan your next safari</h1>
          <p className="mt-3 max-w-[700px] text-sm leading-relaxed text-[#5a4e46]">
            Tell us where you want to go, when you’d like to travel, and how you prefer to experience Africa. We’ll help connect you with the most suitable safari specialists for your trip.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[14px] border border-[#e8e0d8] bg-[#faf7f2] p-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e7c5] text-[#b58927]"><Mail className="h-4 w-4" /></div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#7a6a5c]">Email</div>
                    <a href="mailto:hello@safariasili.com" className="mt-1 block text-sm font-semibold text-[#1d1a18]">hello@safariasili.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e7c5] text-[#b58927]"><Phone className="h-4 w-4" /></div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#7a6a5c]">Phone</div>
                    <a href="tel:+255754200120" className="mt-1 block text-sm font-semibold text-[#1d1a18]">+255 754 200 120</a>
                  </div>
                </div>
                <div className="flex items-start gap-3 md:col-span-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4e7c5] text-[#b58927]"><MapPin className="h-4 w-4" /></div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#7a6a5c]">Location</div>
                    <p className="mt-1 text-sm font-semibold text-[#1d1a18]">Arusha, Tanzania</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[14px] border border-[#e8e0d8] bg-[#1f1712] p-5 text-white">
              <h2 className="text-[1.4rem] font-bold" style={{ fontFamily: 'Georgia, serif' }}>Need a quote fast?</h2>
              <p className="mt-3 text-sm leading-relaxed text-white">
                Our team can help tailor the right itinerary for your dream safari in a few hours.
              </p>
              <Link href="/quote/request" className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#f4c45b] px-4 py-2.5 text-sm font-bold text-[#2d1a12] hover:brightness-105">
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
