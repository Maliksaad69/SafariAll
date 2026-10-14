import Link from 'next/link';
import { ShieldCheck, Award, Lock, ArrowUpRight } from 'lucide-react';

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
    <footer className="mt-6 border-t border-[var(--glass-border)] bg-white/60 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-[var(--border-soft)] pb-12 md:grid-cols-12">
          <div className="space-y-5 md:col-span-4">
            <img
              src="/images/safaribuilt-logo.png"
              alt="SafariRequest — One Marketplace for African Safari Tours"
              className="h-[44px] w-auto"
              style={{ mixBlendMode: 'multiply' }}
            />

            <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
              Africa&apos;s direct safari marketplace. Connecting global travelers with licensed local tour operators across Tanzania, Kenya, South Africa, Uganda, and beyond. Zero commission. Pure experience.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/25 bg-[var(--brand-soft)] px-3 py-2 text-xs font-semibold text-[var(--brand-ink)]">
              <ShieldCheck className="h-4 w-4" />
              100% Verified Local Operator Network
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.heading} className="md:col-span-2">
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-[var(--ink)]">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-[var(--ink-secondary)] transition-colors hover:text-[var(--brand-ink)]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-4">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--ink)]">For Tour Operators</h4>
            <p className="mb-5 text-sm leading-relaxed text-[var(--ink-secondary)]">
              Are you a licensed African safari company? Join our verified operator network and receive direct traveler quote requests — free of charge.
            </p>
            <Link
              href="/register?role=OPERATOR"
              className="btn btn-primary"
            >
              <Award className="h-4 w-4" />
              Register Your Agency
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
              <Lock className="h-3.5 w-3.5" />
              Anti-scam verification · Direct booking · No hidden fees
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-[var(--ink-muted)] sm:flex-row">
          <p>© {year} SafariRequest. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="transition-colors hover:text-[var(--ink)]">Privacy Policy</Link>
            <Link href="/faq" className="transition-colors hover:text-[var(--ink)]">FAQ</Link>
            <Link href="/how-it-works" className="transition-colors hover:text-[var(--ink)]">How It Works</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
