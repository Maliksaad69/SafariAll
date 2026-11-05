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
    <footer className="mt-12 border-t border-[#0F2840] bg-[#143250] text-white">
      <div className="mx-auto max-w-[1230px] px-4 sm:px-6 pt-14 pb-10">
        {/* Responsive 5-column grid fixing the previous 14-col overflow */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 border-b border-white/10 pb-12">
          {/* Column 1: Brand overview */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
              <img
                src="/images/safaribuilt-logo.png"
                alt="SafariRequest — One Marketplace for African Safari Tours"
                className="h-[48px] sm:h-[58px] w-auto object-contain"
              />
            </Link>

            <p className="text-sm leading-relaxed text-[#DDEAF5]/85">
              Africa&apos;s direct safari marketplace. Connecting global travelers with licensed local tour operators. Zero commission. Pure experience.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#E46924]/40 bg-[#E46924]/15 px-3 py-1.5 text-xs font-semibold text-[#E46924]">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>100% Verified Local Operators</span>
            </div>
          </div>

          {/* Columns 2-4: Categorized Links */}
          {columns.map((col) => (
            <div key={col.heading} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                {col.heading}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block py-1 text-sm text-[#DDEAF5]/80 transition-colors hover:text-[#E46924]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Column 5: For Tour Operators CTA */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              For Tour Operators
            </h4>
            <p className="text-sm leading-relaxed text-[#DDEAF5]/85">
              Are you a licensed African safari company? Join our verified network and receive direct traveler quote requests — free of charge.
            </p>
            <div className="pt-1">
              <Link
                href="/register?role=OPERATOR"
                className="btn btn-primary w-full justify-center text-sm bg-[#E46924] hover:bg-[#C85312] text-white"
              >
                <Award className="h-4 w-4" />
                Register Your Agency
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-[#DDEAF5]/60 pt-1">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>Anti-scam verification · No hidden fees</span>
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-[#DDEAF5]/70 sm:flex-row text-center sm:text-left">
          <p>© {year} SafariRequest. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
            <Link href="/privacy-policy" className="py-1 transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/faq" className="py-1 transition-colors hover:text-white">
              FAQ
            </Link>
            <Link href="/how-it-works" className="py-1 transition-colors hover:text-white">
              How It Works
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
