import Link from 'next/link';
import { Award, Lock, ArrowUpRight } from 'lucide-react';
import LoneAlphaBadge from '@/components/LoneAlphaBadge';

export default function Footer() {
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: 'Destinations',
      links: [
        { label: 'Tanzania Safaris', href: '/african-safari-tours?country=Tanzania' },
        { label: 'Kenya Safaris', href: '/african-safari-tours?country=Kenya' },
        { label: 'South Africa', href: '/african-safari-tours?country=South+Africa' },
        { label: 'Uganda — Gorillas', href: '/african-safari-tours?country=Uganda' },
        { label: 'Botswana', href: '/african-safari-tours?country=Botswana' },
        { label: 'All Destinations', href: '/top-safari-countries' },
      ],
    },
    {
      heading: 'Safari Types',
      links: [
        { label: 'Luxury Tented Camps', href: '/african-safari-tours?comfort=LUXURY' },
        { label: 'Mid-Range Lodge', href: '/african-safari-tours?comfort=MID_RANGE' },
        { label: 'Budget Camping', href: '/african-safari-tours?comfort=BUDGET' },
        { label: 'Fly-in Safaris', href: '/african-safari-tours?comfort=FLY_IN' },
        { label: 'Private Tailor-Made', href: '/african-safari-tours?tourType=PRIVATE' },
        { label: 'All Packages', href: '/african-safari-tours' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About Us', href: '/about-us' },
        { label: 'Safari Tour Operators', href: '/safari-operators' },
        { label: 'Traveler Reviews', href: '/safari-reviews' },
        { label: 'Safari Blog', href: '/safari-blog' },
        { label: 'Best Price Guarantee', href: '/best-price-guarantee' },
        { label: 'Contact Us', href: '/contact-us' },
        { label: 'Search', href: '/search' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'FAQ', href: '/faq' },
      ],
    },
  ];

  return (
    <footer className="mt-12 border-t border-white/10 bg-[#092a26] text-[#b9c9c1]">
      <div className="mx-auto max-w-[1230px] px-4 sm:px-6 pt-14 pb-10">
        {/* Responsive 5-column grid fixing the previous 14-col overflow */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 border-b border-white/10 pb-12">
          {/* Column 1: Brand overview */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90" aria-label="SafariHello homepage">
              <div className="inline-flex items-center bg-white rounded-xl px-3.5 py-1.5 shadow-sm">
                <img
                  src="/images/safaribuilt-logo.png?v=6"
                  alt="SafariHello — Africa's Marketplace for Safari Tours"
                  className="h-[38px] sm:h-[44px] w-auto object-contain"
                />
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-[#b9c9c1]">
              Africa&apos;s marketplace for safari tours. Discover amazing wildlife experiences and connect directly with local safari operators.
            </p>
          </div>

          {/* Columns 2-4: Categorized Links */}
          {columns.map((col) => (
            <div key={col.heading} className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                {col.heading}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block py-1 text-sm text-[#b9c9c1] transition-colors hover:text-[#e78748]"
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
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              For Tour Operators
            </h4>
            <p className="text-sm leading-relaxed text-[#b9c9c1]">
              Are you a licensed African safari company? Join our verified network and receive direct traveler quote requests — free of charge.
            </p>
            <div className="pt-1">
              <Link
                href="/register?role=OPERATOR"
                className="btn w-full justify-center text-sm bg-[#e78748] hover:bg-[#d97536] text-[#092a26] font-extrabold border-transparent shadow-xs transition-colors"
              >
                <Award className="h-4 w-4" />
                Register Your Agency
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-[#8d9b92] pt-1">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>Anti-scam verification · No hidden fees</span>
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="grid grid-cols-1 items-center gap-4 pt-8 text-xs text-[#8d9b92] lg:grid-cols-3">
          <p className="order-1 text-center lg:text-left">
            © {year} SafariHello. All rights reserved.
          </p>
          <div className="order-2 flex justify-center">
            <LoneAlphaBadge />
          </div>
          <div className="order-3 flex flex-wrap items-center justify-center gap-5 sm:gap-6 lg:justify-end">
            <Link href="/privacy-policy" className="py-1 transition-colors hover:text-[#e78748]">
              Privacy Policy
            </Link>
            <Link href="/faq" className="py-1 transition-colors hover:text-[#e78748]">
              FAQ
            </Link>
            <Link href="/how-it-works" className="py-1 transition-colors hover:text-[#e78748]">
              How It Works
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
