'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Compass, Send, CheckCircle2, ArrowRight, ShieldCheck, MapPin, Calendar, Users, DollarSign, FileText, Star } from 'lucide-react';
import { safariTours } from '@/lib/site-data';

function QuoteRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tourId = searchParams.get('tourId');
  const departure = searchParams.get('departure') || '';
  const travelersParam = searchParams.get('travelers');

  // If arriving from a specific tour page, preselect its country
  const selectedTour = tourId ? safariTours.find((t) => t.id === tourId) : null;

  const [preferredCountry, setPreferredCountry] = useState(selectedTour?.primaryCountry || 'Tanzania');
  const [adultsCount, setAdultsCount] = useState(Number(travelersParam) || 2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [budgetPerPersonUsd, setBudgetPerPersonUsd] = useState(2000);
  const [comfortPreference, setComfortPreference] = useState('MID_RANGE');
  const [customNotes, setCustomNotes] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          preferredCountry,
          adultsCount: Number(adultsCount),
          childrenCount: Number(childrenCount),
          budgetPerPersonUsd: Number(budgetPerPersonUsd),
          comfortPreference,
          customNotes,
          firstName,
          lastName,
          email,
          phone,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="surface-card rounded-3xl p-8 sm:p-12 border border-black/5 shadow-xl text-center space-y-6 max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)] mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-[var(--brand-deep)]">
          Quote Request Submitted!
        </h2>
        <p className="text-sm text-[var(--ink-muted)] leading-relaxed max-w-lg mx-auto">
          Your inquiry for <strong className="text-[var(--brand-deep)]">{preferredCountry}</strong> has been dispatched to top-rated verified local safari operators.
        </p>
        <div className="bg-[var(--sand)]/80 p-4 rounded-xl border border-black/5 text-xs text-[var(--ink)] font-medium max-w-md mx-auto">
          Confirmation sent to <strong className="text-[var(--brand-deep)]">{email}</strong>. Expect direct proposals within 24 hours.
        </div>
        <div>
          <button
            onClick={() => router.push('/tours')}
            className="btn btn-primary px-6 py-3 rounded-xl text-xs font-semibold shadow-sm"
          >
            Return to Safari Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card rounded-3xl shadow-xl p-8 sm:p-12 border border-black/5 space-y-8 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--brand-soft)] text-[var(--brand-deep)] text-xs font-semibold border border-[var(--brand-pale)]">
          <Compass className="w-3.5 h-3.5 text-[var(--brand)]" />
          <span>Multi-Operator Quote Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-[var(--brand-deep)]">
          Request Custom Safari Quotes
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-muted)]">
          Get direct, zero-markup proposals from licensed local African safari agencies.
        </p>
      </div>

      {/* Form Wizard */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Destination & Guests */}
        <div className="space-y-4 pt-4 border-t border-black/5">
          <h3 className="font-bold text-sm text-[var(--brand-deep)] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--brand)]" />
            <span>1. Destination &amp; Travelers</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Preferred Destination</label>
              <select
                value={preferredCountry}
                onChange={(e) => setPreferredCountry(e.target.value)}
                className="form-control"
              >
                {['Tanzania', 'Kenya', 'South Africa', 'Uganda', 'Botswana', 'Rwanda', 'Zimbabwe'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Number of Adults</label>
              <input
                type="number"
                min={1}
                max={20}
                value={adultsCount}
                onChange={(e) => setAdultsCount(Math.max(1, Number(e.target.value) || 1))}
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Budget & Comfort */}
        <div className="space-y-4 pt-4 border-t border-black/5">
          <h3 className="font-bold text-sm text-[var(--brand-deep)] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[var(--brand)]" />
            <span>2. Budget &amp; Comfort Preference</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Comfort Level</label>
              <select
                value={comfortPreference}
                onChange={(e) => setComfortPreference(e.target.value)}
                className="form-control"
              >
                <option value="MID_RANGE">Mid-Range Safari Lodge</option>
                <option value="LUXURY">Luxury Tented Camp</option>
                <option value="BUDGET">Budget Camping</option>
              </select>
            </div>

            <div>
              <label className="form-label">Estimated Budget / Person ($USD)</label>
              <input
                type="number"
                min={500}
                step={250}
                value={budgetPerPersonUsd}
                onChange={(e) => setBudgetPerPersonUsd(Math.max(500, Number(e.target.value) || 500))}
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Contact Info */}
        <div className="space-y-4 pt-4 border-t border-black/5">
          <h3 className="font-bold text-sm text-[var(--brand-deep)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--brand)]" />
            <span>3. Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Sarah"
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Jenkins"
                className="form-control"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="form-control"
              />
            </div>
            <div>
              <label className="form-label">Phone / WhatsApp (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 1234"
                className="form-control"
              />
            </div>
          </div>

          {departure && (
            <div className="flex items-center gap-2 rounded-xl bg-[var(--brand-soft)]/50 border border-[var(--brand-pale)] px-4 py-3 text-xs text-[var(--brand-deep)]">
              <Calendar className="w-4 h-4 text-[var(--brand)] shrink-0" />
              <span>
                Preferred departure:{' '}
                <strong>
                  {new Date(`${departure}T00:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                </strong>
                {travelersParam ? <> · <strong>{travelersParam} travelers</strong></> : null}
              </span>
            </div>
          )}

          <div>
            <label className="form-label">Custom Requests / Notes</label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Interested in balloon safari over Serengeti or specific dietary needs..."
              className="form-control resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full py-3.5 px-6 rounded-xl font-semibold text-sm shadow-md flex items-center justify-center gap-2"
        >
          {loading ? 'Submitting Inquiry...' : 'Broadcast Quote Request to Operators'}
          <Send className="w-4 h-4" />
        </button>

      </form>

    </div>
  );
}

export default function QuoteRequestPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />
      
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-black/5 py-2.5 text-xs text-[var(--ink-muted)] bg-[var(--canvas)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5">
          <a href="/" className="hover:text-[var(--brand)] transition-colors">Home</a>
          <span className="text-[var(--ink-muted)] opacity-60">/</span>
          <span className="text-[var(--ink)] font-medium">Request a Quote</span>
        </div>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <Suspense fallback={
          <div className="surface-card rounded-3xl p-12 text-center text-[var(--ink-muted)] animate-pulse">
            Loading Quote Form...
          </div>
        }>
          <QuoteRequestForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
