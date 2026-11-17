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
    <footer className="mt-16 border-t border-white/10 bg-[#132220] text-white">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-14 pb-10">
        {/* Responsive 5-column grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 border-b border-white/10 pb-12">
          {/* Column 1: Brand overview */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block transition-opacity hover:opacity-90" aria-label="SafariHello homepage">
              <img
                src="/images/safaribuilt-logo.png?v=6"
                alt="SafariHello — Africa's Marketplace for Safari Tours"
                className="h-[38px] sm:h-[44px] w-auto object-contain brightness-0 invert"
              />
            </Link>

            <p className="text-sm leading-relaxed text-[#D8DFDC] font-normal">
              Africa&apos;s marketplace for safari tours. Discover authentic wildlife journeys and connect directly with verified local operators.
            </p>
          </div>

          {/* Columns 2-4: Categorized Links */}
          {columns.map((col) => (
            <div key={col.heading} className="space-y-3">
              <h4 className="text-xs font-semibold text-[#E59E67]">
                {col.heading}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block py-0.5 text-xs sm:text-sm font-normal text-[#D8DFDC] transition-colors hover:text-white"
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
            <h4 className="text-xs font-semibold text-[#E59E67]">
              For Tour Operators
            </h4>
            <p className="text-sm leading-relaxed text-[#D8DFDC] font-normal">
              Licensed African safari companies can join our verified directory and receive traveler quote requests directly.
            </p>
            <div className="pt-1">
              <Link
                href="/register?role=OPERATOR"
                className="btn w-full justify-center text-xs sm:text-sm bg-[#C9773B] hover:bg-[#B86930] text-white font-medium rounded-lg shadow-xs transition-colors"
              >
                <Award className="h-4 w-4" strokeWidth={1.5} />
                <span>Register your agency</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-[#8C9C98] pt-1 font-normal">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>Verified directory · Direct bookings</span>
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="grid grid-cols-1 items-center gap-4 pt-8 text-xs text-[#8C9C98] font-normal lg:grid-cols-3">
          <p className="order-1 text-center lg:text-left">
            © {year} SafariHello. All rights reserved.
          </p>
          <div className="order-2 flex justify-center">
            <LoneAlphaBadge />
          </div>
          <div className="order-3 flex flex-wrap items-center justify-center gap-5 sm:gap-6 lg:justify-end">
            <Link href="/privacy-policy" className="py-1 transition-colors hover:text-white">
              Privacy policy
            </Link>
            <Link href="/faq" className="py-1 transition-colors hover:text-white">
              FAQ
            </Link>
            <Link href="/how-it-works" className="py-1 transition-colors hover:text-white">
              How it works
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
