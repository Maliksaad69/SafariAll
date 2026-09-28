'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Search, MapPin, CalendarRange, ArrowRight } from 'lucide-react';
import SearchAutocomplete from '@/components/SearchAutocomplete';

const suggestedSearches = [
  { term: 'Tanzania safari packages', href: '/tours?country=Tanzania' },
  { term: 'Kenya luxury safari', href: '/tours?country=Kenya&comfort=LUXURY' },
  { term: 'Botswana Okavango delta', href: '/tours?search=okavango' },
  { term: 'Uganda gorilla trekking', href: '/tours?search=gorilla&country=Uganda' },
  { term: 'South Africa kruger safari', href: '/parks/kruger-national-park' },
  { term: 'Namibia desert adventure', href: '/tours?search=desert' },
  { term: 'budget camping safari', href: '/tours?comfort=BUDGET' },
  { term: 'private guided safari', href: '/tours?tourType=PRIVATE' },
];

const featuredDestinations = [
  { name: 'Tanzania', blurb: 'Serengeti & Ngorongoro', href: '/tours?country=Tanzania' },
  { name: 'Kenya', blurb: 'Masai Mara & Amboseli', href: '/tours?country=Kenya' },
  { name: 'Botswana', blurb: 'Okavango Delta', href: '/tours?country=Botswana' },
  { name: 'South Africa', blurb: 'Kruger & Private Reserves', href: '/tours?country=South+Africa' },
];

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#2d1a12]">
      <Navbar />

      <main className="mx-auto max-w-[1230px] px-4 py-10 sm:px-6">
        <section className="rounded-[18px] border border-[#d8d1c8] bg-[#1f1712] p-7 shadow-[0_12px_28px_rgba(10,8,6,0.25)] md:p-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f5d27a]/30 bg-[#f5d27a]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#f9d98a]">
            <Search className="h-3.5 w-3.5" />
            Safari Search
          </div>
          <h1 className="text-[2.5rem] font-bold tracking-[-0.04em] text-white" style={{ fontFamily: 'Georgia, serif' }}>Find the right safari for you</h1>
          <p className="mt-3 max-w-[700px] text-sm leading-relaxed text-white">
            Search by destination, travel style, duration, and budget to compare top-rated safari packages across Africa. Start typing to see live suggestions.
          </p>

          <div className="mt-8 rounded-[14px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm max-w-2xl">
            <SearchAutocomplete />
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {suggestedSearches.map((item) => (
              <Link
                key={item.term}
                href={item.href}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] text-white hover:bg-white/10 hover:text-white transition-colors"
              >
                {item.term}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[16px] border border-[#d8d1c8] bg-white p-7 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-[#b58927]" />
            <h2 className="text-[2rem] font-bold tracking-[-0.04em] text-[#1e1a18]" style={{ fontFamily: 'Georgia, serif' }}>Popular destinations</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredDestinations.map((destination) => (
              <Link key={destination.name} href={destination.href} className="rounded-[14px] border border-[#e8e0d8] bg-[#faf7f2] p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#f4e7c5] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#b58927]">
                  <CalendarRange className="h-3.5 w-3.5" />
                  Top safari
                </div>
                <h3 className="text-[1.6rem] font-bold text-[#1d1a18]" style={{ fontFamily: 'Georgia, serif' }}>{destination.name}</h3>
                <p className="mt-2 text-sm text-[#5a4e46]">{destination.blurb}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2e6a64]">
                  View packages
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
