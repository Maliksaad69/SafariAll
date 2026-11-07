import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Compass, ShieldCheck, HelpCircle, ArrowRight, MessageSquareQuote, CheckCircle2 } from 'lucide-react';

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--ink-body)]">
      <Navbar />

      <main className="mx-auto max-w-[1230px] px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-2xl sm:rounded-3xl border border-[#DEDCCF] bg-white p-6 sm:p-10 md:p-12 shadow-sm">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#E4DBB4]/40 border border-[#DEDCCF] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#193A38]">
            <Compass className="h-3.5 w-3.5 text-[#214446]" />
            <span>Plan Your Journey</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#193A38] font-display">
            How can we help with your safari?
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-[#344C49]">
            Tell us where you want to go, when you&apos;d like to travel, and how you prefer to experience Africa. We connect you directly with vetted, licensed local safari operators who prepare custom itineraries with transparent local pricing.
          </p>

          {/* Core Support & Inquiry Pathways */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {/* 1. Custom Quote Card (Primary Highlight) */}
            <div className="rounded-2xl border border-[#214446] bg-[#214446] p-6 text-white flex flex-col justify-between shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-[#E4DBB4] mb-4">
                  <MessageSquareQuote className="h-5 w-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                  Request a Custom Quote
                </h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-white/85">
                  Share your dream destinations, dates, group size, and comfort tier. Receive tailor-made proposals from local specialists with zero middleman fees.
                </p>
                <div className="mt-4 space-y-1.5 text-xs text-white/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#E4DBB4] shrink-0" />
                    <span>Free custom itineraries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#E4DBB4] shrink-0" />
                    <span>Direct local operator pricing</span>
                  </div>
                </div>
              </div>
              <Link
                href="/custom-safari-quote"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E4DBB4] hover:bg-[#D8CDA1] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#193A38] transition-all shadow-xs group-hover:translate-x-0.5"
              >
                <span>Request a Free Quote</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* 2. Direct Operator Directory */}
            <div className="rounded-2xl border border-[#DEDCCF] bg-[#F7F6F1] p-6 flex flex-col justify-between shadow-xs hover:border-[#214446]/40 transition-colors">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#214446]/10 text-[#214446] mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-display text-[#193A38]">
                  Browse Verified Operators
                </h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#344C49]">
                  Want to message an outfitter directly? Explore licensed local companies across Tanzania, Kenya, Botswana, Uganda, and South Africa with traveler reviews.
                </p>
                <div className="mt-4 space-y-1.5 text-xs text-[#516D6A]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#214446] shrink-0" />
                    <span>100% verified licenses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#214446] shrink-0" />
                    <span>Direct chat &amp; reviews</span>
                  </div>
                </div>
              </div>
              <Link
                href="/safari-operators"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-[#214446] bg-white hover:bg-[#214446] hover:text-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#214446] transition-all shadow-xs"
              >
                <span>View Operators</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* 3. Frequently Asked Questions */}
            <div className="rounded-2xl border border-[#DEDCCF] bg-[#F7F6F1] p-6 flex flex-col justify-between shadow-xs hover:border-[#214446]/40 transition-colors">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#214446]/10 text-[#214446] mb-4">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-display text-[#193A38]">
                  Help Center &amp; FAQs
                </h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#344C49]">
                  Find instant answers about best times for the Great Migration, park fees, payment protection, visa requirements, and tipping etiquette.
                </p>
                <div className="mt-4 space-y-1.5 text-xs text-[#516D6A]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#214446] shrink-0" />
                    <span>Answers from safari experts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#214446] shrink-0" />
                    <span>Payment &amp; booking terms</span>
                  </div>
                </div>
              </div>
              <Link
                href="/faq"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-[#214446] bg-white hover:bg-[#214446] hover:text-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#214446] transition-all shadow-xs"
              >
                <span>Explore FAQs</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
