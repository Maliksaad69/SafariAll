import Link from 'next/link';
import { Compass, ShieldCheck, Award, Lock, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: 'Destinations',
      links: [
        { label: 'Tanzania Safaris', href: '/tours?country=Tanzania' },
        { label: 'Kenya Safaris', href: '/tours?country=Kenya' },
        { label: 'South Africa', href: '/tours?country=South+Africa' },
        { label: 'Uganda — Gorillas', href: '/tours?country=Uganda' },
        { label: 'Botswana', href: '/tours?country=Botswana' },
        { label: 'All Destinations', href: '/parks' },
      ],
    },
    {
      heading: 'Safari Types',
      links: [
        { label: 'Luxury Tented Camps', href: '/tours?comfort=LUXURY' },
        { label: 'Mid-Range Lodge', href: '/tours?comfort=MID_RANGE' },
        { label: 'Budget Camping', href: '/tours?comfort=BUDGET' },
        { label: 'Fly-in Safaris', href: '/tours?comfort=FLY_IN' },
        { label: 'Private Tailor-Made', href: '/tours?tourType=PRIVATE' },
        { label: 'All Packages', href: '/tours' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About Us', href: '/about-us' },
        { label: 'Best Price Guarantee', href: '/best-price-guarantee' },
        { label: 'Traveler Reviews', href: '/reviews' },
        { label: 'Contact Us', href: '/contact-us' },
        { label: 'Search', href: '/search' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'FAQ', href: '/faq' },
      ],
    },
  ];

  return (
    <footer
      style={{
        backgroundColor: 'var(--dark)',
        color: 'var(--dark-text-soft)',
        fontFamily: 'var(--font-body), sans-serif',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="md:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <img
                src="/images/safaribuilt-logo.png"
                alt="SafariBuilt — One Marketplace for African Safari Tours"
                className="h-[44px] w-auto rounded-lg bg-white/95 px-2 py-1"
              />
            </div>

            <p className="text-sm leading-relaxed" style={{ color: 'var(--dark-text-soft)' }}>
              Africa&apos;s direct safari marketplace. Connecting global travelers with licensed local tour operators across Tanzania, Kenya, South Africa, Uganda, and beyond. Zero commission. Pure experience.
            </p>

            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(231,179,92,0.12)', border: '1px solid rgba(231,179,92,0.3)', color: 'var(--dark-gold)' }}
            >
              <ShieldCheck className="w-4 h-4" />
              100% Verified Local Operator Network
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.heading} className="md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-widest mb-5 text-white">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm transition-colors hover:text-white" style={{ color: 'var(--dark-text-soft)' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white">For Tour Operators</h4>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: 'var(--dark-text-soft)' }}>
              Are you a licensed African safari company? Join our verified operator network and receive direct traveler quote requests — free of charge.
            </p>
            <Link
              href="/register?role=OPERATOR"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--dark-gold)', color: 'var(--dark)', boxShadow: '0 4px 16px rgba(231,179,92,0.2)' }}
            >
              <Award className="w-4 h-4" />
              Register Your Agency
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <p className="mt-4 flex items-center gap-1.5 text-xs" style={{ color: 'rgba(250,247,240,0.45)' }}>
              <Lock className="w-3.5 h-3.5" />
              Anti-scam verification · Direct booking · No hidden fees
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: 'rgba(250,247,240,0.5)' }}>
          <p>© {year} SafariBuilt. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
