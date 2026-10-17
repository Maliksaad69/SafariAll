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
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-black/5 py-2.5 text-xs text-[var(--ink-muted)] bg-[var(--canvas)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">Home</Link>
          <span className="text-[var(--ink-muted)] opacity-60">/</span>
          <span className="text-[var(--ink)] font-medium">Search Safaris</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[var(--brand-deep)] text-white shadow-xl p-8 sm:p-14">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')" }} 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-deep)] via-[var(--brand-deep)]/90 to-transparent" />
          <div className="relative max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md text-[var(--brand-light)]">
              <Search className="h-3.5 w-3.5 text-[var(--brand-light)]" />
              <span>Safari Search</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-white mb-4 leading-tight">
              Find the perfect African safari
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-white/85 font-light mb-8 max-w-2xl">
              Search by destination, travel comfort style, duration, and wildlife highlights across East and Southern Africa.
            </p>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-3 sm:p-4 backdrop-blur-md max-w-2xl shadow-xl">
              <SearchAutocomplete />
            </div>

            <div className="mt-6 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-white/60 mr-1">Trending:</span>
              {suggestedSearches.map((item) => (
                <Link
                  key={item.term}
                  href={item.href}
                  className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-xs text-white/90 hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm"
                >
                  {item.term}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 surface-card rounded-3xl border border-black/5 p-8 sm:p-12 shadow-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-[var(--brand)] block">Destinations</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-[var(--brand-deep)]">
                Popular African Safari Destinations
              </h2>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredDestinations.map((destination) => (
              <Link 
                key={destination.name} 
                href={destination.href} 
                className="group rounded-2xl border border-black/5 bg-[var(--sand)]/50 p-6 transition-all hover:-translate-y-1 hover:border-[var(--brand)]/30 hover:shadow-md"
              >
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-soft)] border border-[var(--brand-pale)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-deep)]">
                  <CalendarRange className="h-3 w-3 text-[var(--brand)]" />
                  <span>Top safari</span>
                </div>
                <h3 className="text-xl font-bold font-display text-[var(--brand-deep)] group-hover:text-[var(--brand)] transition-colors">
                  {destination.name}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
                  {destination.blurb}
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand)] group-hover:translate-x-0.5 transition-transform">
                  <span>View packages</span>
                  <ArrowRight className="h-3.5 w-3.5" />
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
