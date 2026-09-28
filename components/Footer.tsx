import Link from 'next/link';
import { Compass, ShieldCheck, Award, Lock, ArrowUpRight, CheckCircle2, Globe, Building2 } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: 'Top Destinations',
      links: [
        { label: 'Tanzania Safaris', href: '/tours?country=Tanzania' },
        { label: 'Kenya Safaris', href: '/tours?country=Kenya' },
        { label: 'South Africa Safaris', href: '/tours?country=South+Africa' },
        { label: 'Uganda Gorillas', href: '/tours?country=Uganda' },
        { label: 'Botswana Wilderness', href: '/tours?country=Botswana' },
        { label: 'Rwanda Primate Safaris', href: '/tours?country=Rwanda' },
        { label: 'All National Parks', href: '/parks' },
      ],
    },
    {
      heading: 'Safari Experiences',
      links: [
        { label: 'Luxury Tented Camps', href: '/tours?comfort=LUXURY' },
        { label: 'Mid-Range Lodges', href: '/tours?comfort=MID_RANGE' },
        { label: 'Budget Camping Safaris', href: '/tours?comfort=BUDGET' },
        { label: 'Fly-in Safaris', href: '/tours?comfort=FLY_IN' },
        { label: 'Private Guided Tours', href: '/tours?tourType=PRIVATE' },
        { label: 'All Safari Packages', href: '/tours' },
      ],
    },
    {
      heading: 'Company & Support',
      links: [
        { label: 'About SafariBuilt', href: '/about-us' },
        { label: 'Verified Operator Directory', href: '/operators' },
        { label: 'Best Price Guarantee', href: '/best-price-guarantee' },
        { label: 'Traveler Reviews', href: '/reviews' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'Help & FAQ', href: '/faq' },
        { label: 'Contact Support', href: '/contact-us' },
      ],
    },
  ];

  return (
    <footer className="bg-[#171512] text-stone-300 font-sans border-t border-stone-800">
      {/* ── Top Prominent Callout Banner for Tour Agencies ── */}
      <div className="border-b border-stone-800 bg-gradient-to-r from-stone-900 via-[#1C1813] to-stone-900 py-10">
        <div className="max-w-[1230px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-stone-900 border border-amber-500/30 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" /> For Safari Agencies &amp; Local Tour Operators
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white font-display tracking-tight">
                Grow Your Safari Agency with Direct Traveler Requests
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed">
                Join Africa&apos;s verified safari marketplace. Receive direct traveler inquiries with zero middleman commissions, custom quote requests, and instant operator profile visibility.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs font-semibold text-amber-200/90">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> 100% Free Agency Listing</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Direct Traveler Contact</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-amber-400" /> Verified Trust Badge</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-shrink-0">
              <Link
                href="/register?role=OPERATOR"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-extrabold bg-[var(--gold)] text-stone-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 hover:scale-105"
              >
                <Award className="w-4 h-4" />
                Register Your Agency
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/operator-portal"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold bg-stone-800 text-white border border-stone-700 hover:bg-stone-700 transition-colors"
              >
                Operator Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Links Section ── */}
      <div className="max-w-[1230px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-stone-800/80">
          {/* Brand Identity Column */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <img
                src="/images/safaribuilt-logo.png"
                alt="SafariBuilt Logo"
                className="h-[42px] w-auto object-contain bg-white rounded-xl px-2.5 py-1.5 shadow-sm"
              />
              <div className="flex flex-col">
                <span className="text-[22px] font-extrabold tracking-tight text-white font-display">
                  Safari<span className="text-amber-400">Built</span>
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                  Safari Directory &amp; Marketplace
                </span>
              </div>
            </Link>

            <p className="text-xs text-stone-300 leading-relaxed max-w-sm">
              Africa&apos;s direct safari marketplace. Connecting global travelers with licensed local tour operators across Tanzania, Kenya, South Africa, Uganda, and Botswana. Transparent pricing, verified reviews, zero commission.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 border border-stone-800 text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Verified Local Operator Network
            </div>
          </div>

          {/* Nav Columns */}
          {columns.map((col) => (
            <div key={col.heading} className="md:col-span-2 sm:col-span-4">
              <h4 className="text-xs font-extrabold uppercase tracking-widest mb-4 text-amber-400 font-display">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-xs text-stone-300 transition-colors hover:text-white hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom Utility Bar ── */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {year} SafariBuilt Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
