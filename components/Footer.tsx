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
        { label: 'Fly-in Safaris', href: '/tours?type=FLY_IN' },
        { label: 'Private Tailor-Made', href: '/tours?type=PRIVATE' },
        { label: 'All Packages', href: '/tours' },
      ],
    },
  ];

  return (
    <footer
      style={{
        backgroundColor: '#1C1108',
        color: 'rgba(250,247,240,0.55)',
        fontFamily: 'var(--font-body), sans-serif',
      }}
    >
      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Brand Column */}
          <div className="md:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #B8811A 0%, #D4A235 100%)', boxShadow: '0 4px 16px rgba(184,129,26,0.35)' }}
              >
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <span
                  className="text-xl font-bold text-white leading-none block"
                  style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
                >
                  Safari<span style={{ color: '#D4A235' }}>Asili</span>
                </span>
                <span
                  className="text-[10px] uppercase tracking-widest font-semibold mt-0.5 block"
                  style={{ color: '#D4A235' }}
                >
                  African Marketplace
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: 'rgba(250,247,240,0.5)' }}>
              Africa's direct safari marketplace. Connecting global travelers with licensed
              local tour operators across Tanzania, Kenya, South Africa, Uganda, and beyond.
              Zero commission. Pure experience.
            </p>

            {/* Trust badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{
                background: 'rgba(184,129,26,0.12)',
                border: '1px solid rgba(184,129,26,0.25)',
                color: '#D4A235',
              }}
            >
              <ShieldCheck className="w-4 h-4" />
              100% Verified Local Operator Network
            </div>
          </div>

          {/* Link Columns */}
          {columns.map((col) => (
            <div key={col.heading} className="md:col-span-2">
              <h4
                className="text-xs font-bold uppercase tracking-widest mb-5 text-white"
              >
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: 'rgba(250,247,240,0.5)' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Operator CTA */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white">
              For Tour Operators
            </h4>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: 'rgba(250,247,240,0.5)' }}>
              Are you a licensed African safari company? Join our verified operator
              network and receive direct traveler quote requests — free of charge.
            </p>
            <Link
              href="/register?role=OPERATOR"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #B8811A 0%, #D4A235 100%)',
                boxShadow: '0 4px 16px rgba(184,129,26,0.3)',
              }}
            >
              <Award className="w-4 h-4" />
              Register Your Agency
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <p className="mt-4 flex items-center gap-1.5 text-xs" style={{ color: 'rgba(250,247,240,0.3)' }}>
              <Lock className="w-3.5 h-3.5" />
              Anti-scam verification · Direct booking · No hidden fees
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: 'rgba(250,247,240,0.3)' }}>
          <p>© {year} SafariAsili. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Operator Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
