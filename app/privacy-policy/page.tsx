import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      {/* Top Breadcrumb Bar */}
      <div className="border-b border-black/5 py-2.5 text-xs text-[var(--ink-muted)] bg-[var(--canvas)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[var(--brand)] transition-colors">Home</Link>
          <span className="text-[var(--ink-muted)] opacity-60">/</span>
          <span className="text-[var(--ink)] font-medium">Privacy Policy</span>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <article className="surface-card rounded-3xl border border-black/5 p-8 sm:p-12 shadow-sm">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--brand-soft)] border border-[var(--brand-pale)] px-3.5 py-1 text-xs font-semibold text-[var(--brand-deep)]">
            <Shield className="w-3.5 h-3.5 text-[var(--brand)]" />
            <span>Privacy Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[var(--brand-deep)] tracking-tight mb-8">
            Your information is handled with care
          </h1>

          <div className="space-y-6 text-sm sm:text-base leading-relaxed text-[var(--ink)]/80">
            <p>
              SafariRequest respects your privacy and handles personal information only for legitimate booking, service, and communication purposes. We use your data to help match you with suitable safari operators, answer inquiries, and improve the quality of the travel planning experience.
            </p>
            <p>
              We may use cookies to remember preferences, improve the site experience, and understand how visitors interact with our content. You can manage your consent settings at any time through the cookies popup or browser settings.
            </p>
            <p>
              We do not sell personal data to third parties for marketing purposes. Information is shared only with trusted operators and service providers required to process your booking inquiry or technical request.
            </p>
            <p>
              This policy may be updated from time to time to reflect changes in regulations or website functionality. Continued use of the site after updates indicates acceptance of the revised policy.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
