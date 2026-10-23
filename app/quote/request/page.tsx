'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useLiveRefresh } from '@/lib/use-live';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Compass, Send, CheckCircle2, ArrowRight, ShieldCheck, MapPin, Calendar, Users, DollarSign, FileText, Star } from 'lucide-react';

function QuoteRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tourId = searchParams.get('tourId');
  const departure = searchParams.get('departure') || '';
  const travelersParam = searchParams.get('travelers');

  // If arriving from a specific tour page, preselect its country
  const [selectedTour, setSelectedTour] = useState<{ id: string; title: string; primaryCountry: string } | null>(null);
  const [countries, setCountries] = useState<string[]>(['Tanzania']);
  const [preferredCountry, setPreferredCountry] = useState('Tanzania');

  useEffect(() => {
    fetch('/api/site/nav')
      .then((r) => r.json())
      .then((d) => d.countries?.length && setCountries(d.countries))
      .catch(() => {});
    if (tourId) {
      fetch(`/api/tours/${encodeURIComponent(tourId)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.tour) {
            setSelectedTour(d.tour);
            setPreferredCountry(d.tour.primaryCountry);
          }
        })
        .catch(() => {});
    }
  }, [tourId]);
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
  const [error, setError] = useState('');

  // Departures of the selected tour, kept live so a sold-out date can never be chosen.
  type Dep = { slotId: string; startDate: string; departureTime: string; route: string | null; spotsLeft: number; maxGroup: number; isFull: boolean; status: string };
  const [departures, setDepartures] = useState<Dep[] | null>(null);
  const [slotId, setSlotId] = useState('');
  const loadDepartures = useCallback(() => {
    if (!selectedTour) return;
    fetch(`/api/tours/${selectedTour.id}/slots`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { availability: [] }))
      .then((d) => {
        const list: Dep[] = d.availability ?? [];
        setDepartures(list);
        setSlotId((cur) => {
          const still = list.find((x) => x.slotId === cur && !x.isFull);
          if (still) return cur;
          const byMonth = departure ? list.find((x) => !x.isFull && x.startDate.startsWith(departure.slice(0, 7))) : undefined;
          return (byMonth ?? list.find((x) => !x.isFull))?.slotId ?? '';
        });
      })
      .catch(() => setDepartures([]));
  }, [selectedTour, departure]);
  useEffect(loadDepartures, [loadDepartures]);
  useLiveRefresh(selectedTour ? `tour=${encodeURIComponent(selectedTour.id)}` : null, loadDepartures);
  const pax = Number(adultsCount) + Number(childrenCount);
  const chosenDep = departures?.find((d) => d.slotId === slotId) ?? null;
  const tourHasDepartures = !!departures && departures.length > 0;
  const soldOut = tourHasDepartures && departures!.every((d) => d.isFull);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (selectedTour && tourHasDepartures) {
      if (soldOut) return setError('Every departure of this tour is fully booked. Please choose another tour.');
      if (!chosenDep) return setError('Choose one of the available departures.');
      if (pax > chosenDep.maxGroup) return setError(`This departure can take at most ${chosenDep.maxGroup} more travellers together.`);
    }
    setLoading(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId: selectedTour?.id ?? tourId,
          slotId: slotId || undefined,
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

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSubmitted(true);
      } else {
        if (Array.isArray(data.availability)) setDepartures(data.availability);
        setError(data.error || 'Could not submit your request. Please try again.');
      }
    } catch {
      setError('Could not reach the server. Please try again.');
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
                {countries.map((c) => (
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

          {selectedTour && departures && (
            <div className="space-y-2">
              <label className="form-label">Departure for {selectedTour.title}</label>
              {departures.length === 0 ? (
                <p className="text-xs text-[var(--ink-muted)]">No departures are scheduled yet. The operator will propose dates.</p>
              ) : soldOut ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                  Every departure of this tour is fully booked or closed. New dates appear here as soon as the operator adds them.
                </p>
              ) : (
                <select value={slotId} onChange={(e) => setSlotId(e.target.value)} className="form-control">
                  {departures.map((d) => (
                    <option key={d.slotId} value={d.slotId} disabled={d.isFull}>
                      {new Date(`${d.startDate}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })} · {d.departureTime}
                      {d.isFull ? (d.status === 'CLOSED' ? ' · Closed' : ' · Fully booked') : ` · ${d.spotsLeft} seats left`}
                    </option>
                  ))}
                </select>
              )}
              {chosenDep && pax > chosenDep.maxGroup && (
                <p className="text-xs font-semibold text-red-700">This departure can take at most {chosenDep.maxGroup} more travellers together.</p>
              )}
            </div>
          )}

          {departure && !selectedTour && (
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

        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={loading || soldOut || (!!chosenDep && pax > chosenDep.maxGroup)}
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
