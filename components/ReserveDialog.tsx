'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLiveRefresh } from '@/lib/use-live';
import { useRouter } from 'next/navigation';
import { X, Loader2, CheckCircle2, AlertCircle, Calendar, Users, Minus, Plus, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface Slot {
  slotId: string;
  startDate: string;
  departureTime: string;
  route: string | null;
  maxTravelers: number;
  bookedTravelers: number;
  spotsLeft: number;
  maxGroup: number;
  isFull: boolean;
  status: 'OPEN' | 'CLOSED';
  note: string | null;
  vehicles: { vehicleId: string; name: string; vehicleType: string; seats: number; bookedSeats: number }[];
}

interface ReserveDialogProps {
  tourId: string;
  tourTitle: string;
  minPriceUsd: number;
}

const QUICK_NOTES = [
  'Airport pickup',
  'Vegetarian meals',
  'Dietary requirements',
  'Honeymoon trip',
  'Travelling with children',
  'Wheelchair accessible',
];

export default function ReserveDialog({ tourId, tourTitle, minPriceUsd }: ReserveDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // null = not loaded yet (drives the skeleton without a setState-in-effect)
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirmedRef, setConfirmedRef] = useState('');

  const requestedPax = adults + children;
  const estimate = minPriceUsd * adults + minPriceUsd * 0.5 * children;

  const list = slots ?? [];
  const hasSlots = list.length > 0;
  const loadingSlots = open && slots === null;
  const activeSlot = hasSlots ? list.find((s) => s.slotId === selectedSlotId) ?? null : null;

  /* Apply a fresh availability list, keeping the traveller's choice when it is still bookable */
  const selectedRef = useRef('');
  useEffect(() => {
    selectedRef.current = selectedSlotId;
  }, [selectedSlotId]);
  const applySlots = useCallback((items: Slot[], initial = false) => {
    setSlots(items);
    const current = items.find((x) => x.slotId === selectedRef.current);
    if (current && !current.isFull) return;
    if (current && !initial) {
      setError(
        current.status === 'CLOSED'
          ? 'The operator has just closed this departure. Please choose another one.'
          : 'Sorry, the last seats on this departure were just booked. Please choose another departure.'
      );
      setStep(1);
    }
    const first = items.find((x) => !x.isFull);
    selectedRef.current = first?.slotId ?? '';
    setSelectedSlotId(first?.slotId ?? '');
    setStartDate(first?.startDate ?? '');
  }, []);

  const loadSlots = useCallback(
    (initial = false) => {
      if (!tourId) return;
      fetch(`/api/tours/${tourId}/slots`, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (Array.isArray(d?.availability)) applySlots(d.availability, initial);
          else if (initial) setSlots([]);
        })
        .catch(() => {
          if (initial) setSlots([]);
        });
    },
    [tourId, applySlots]
  );

  /* Load departures when the dialog opens, then keep them live while it stays open */
  useEffect(() => {
    if (open) loadSlots(true);
  }, [open, loadSlots]);
  useLiveRefresh(open && !success ? `tour=${encodeURIComponent(tourId)}` : null, () => loadSlots());

  /* Lock scroll + close on Escape while open */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const stepOneValid = hasSlots && !!activeSlot && !activeSlot.isFull && requestedPax <= activeSlot.maxGroup;

  const goNext = () => {
    setError('');
    if (hasSlots) {
      if (!activeSlot) return setError('Choose a departure date to continue.');
      if (activeSlot.isFull) return setError('That departure is fully booked — pick another date.');
      if (requestedPax > activeSlot.maxGroup) {
        return setError(
          activeSlot.maxGroup < activeSlot.spotsLeft
            ? `${activeSlot.spotsLeft} seats are left, but at most ${activeSlot.maxGroup} can travel together in one vehicle. Reduce your party or pick another departure.`
            : `Only ${activeSlot.spotsLeft} seat${activeSlot.spotsLeft === 1 ? '' : 's'} left on this departure. Reduce your party to continue.`
        );
      }
    } else {
      return setError('This tour has no scheduled departures yet. Request a quote instead.');
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          startDate: hasSlots ? activeSlot!.startDate : startDate,
          adultsCount: adults,
          childrenCount: children,
          specialRequests,
          slotId: hasSlots ? activeSlot!.slotId : undefined,
        }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      if (res.status === 409 && Array.isArray(data.availability)) {
        // Someone else took the seats first: show the fresh numbers and go back to step 1.
        applySlots(data.availability);
        setStep(1);
      }
      if (!res.ok) throw new Error(data.error || 'Failed to submit reservation request.');

      setConfirmedRef(data.reservation?.reference || '');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  function close() {
    setOpen(false);
    setSuccess(false);
    setError('');
    setStep(1);
    setSlots(null);
    setSelectedSlotId('');
    setStartDate('');
    setAdults(2);
    setChildren(0);
    setSpecialRequests('');
  }

  const addNote = (note: string) => {
    setSpecialRequests((prev) => (prev.trim() ? `${prev.trim()}, ${note.toLowerCase()}` : note));
  };

  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-primary w-full">
        Request Reservation
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[#012D32]/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Request a reservation"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-[0_30px_80px_rgba(1,45,50,0.35)] sm:rounded-3xl">
            {success ? (
              /* ── Success ── */
              <div className="space-y-4 px-6 py-12 text-center sm:px-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--success-soft)] text-[var(--success)]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-semibold text-[var(--ink)]">Reservation request sent</h3>
                {confirmedRef && (
                  <p className="font-mono text-xs uppercase tracking-wider text-[var(--ink-muted)]">
                    Booking ref · {confirmedRef}
                  </p>
                )}
                <p className="mx-auto max-w-md text-sm text-[var(--ink-secondary)]">
                  The agency has your request and will confirm availability. You&apos;ll get a notification, and
                  their contact details unlock in <strong className="text-[var(--ink)]">My trips</strong> once confirmed.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button type="button" onClick={close} className="btn btn-secondary">
                    Close
                  </button>
                  <button type="button" onClick={() => router.push('/my-trips')} className="btn btn-primary">
                    View my trips
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* ── Header ── */}
                <div className="flex items-start justify-between gap-4 border-b border-[var(--border-soft)] px-5 py-4 sm:px-7">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-ink)]">
                      Step {step} of 2 · {step === 1 ? 'Trip details' : 'Preferences'}
                    </p>
                    <h3 className="mt-1 truncate text-lg font-semibold text-[var(--ink)] sm:text-xl">{tourTitle}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close dialog"
                    className="shrink-0 rounded-full p-2 text-[var(--ink-secondary)] transition-colors hover:bg-[var(--surface-sunk)] hover:text-[var(--ink)]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* ── Progress ── */}
                <div className="flex gap-1.5 px-5 pt-3 sm:px-7">
                  <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-[var(--brand)]' : 'bg-[var(--border)]'}`} />
                  <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-[var(--brand)]' : 'bg-[var(--border)]'}`} />
                </div>

                <div className="flex-1 overflow-y-auto">
                  {error && (
                    <div className="mx-5 mt-4 flex items-start gap-2 rounded-xl border border-[rgba(220,38,38,0.25)] bg-[var(--danger-soft)] px-3 py-2 text-xs font-semibold text-[var(--danger)] sm:mx-7">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="px-5 pb-6 pt-5 sm:px-7">
                    {step === 1 ? (
                      <div className="grid gap-6 md:grid-cols-[1.35fr_1fr]">
                        {/* Departure */}
                        <div>
                          <span className="form-label">
                            {hasSlots ? 'Choose your departure' : 'Preferred departure date'}
                          </span>

                          {loadingSlots ? (
                            <div className="space-y-2">
                              {[0, 1, 2].map((i) => (
                                <div key={i} className="h-16 animate-pulse rounded-2xl bg-[var(--surface-sunk)]" />
                              ))}
                            </div>
                          ) : hasSlots ? (
                            <div className="space-y-2">
                              {list.map((s) => {
                                const selected = selectedSlotId === s.slotId;
                                const room = s.maxGroup >= requestedPax;
                                return (
                                  <label
                                    key={s.slotId}
                                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all ${
                                      s.isFull
                                        ? 'cursor-not-allowed border-[var(--border-soft)] opacity-55'
                                        : selected
                                          ? 'border-[var(--brand)] bg-[var(--brand-soft)] shadow-[0_2px_10px_rgba(0,153,146,0.18)]'
                                          : 'border-[var(--border)] hover:border-[var(--brand)]/50 hover:bg-[var(--surface-sunk)]'
                                    }`}
                                  >
                                    <div className="flex min-w-0 items-center gap-3">
                                      <span
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                          selected ? 'bg-[var(--brand)] text-white' : 'bg-[var(--surface-sunk)] text-[var(--ink-secondary)]'
                                        }`}
                                      >
                                        <Calendar className="h-4 w-4" />
                                      </span>
                                      <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold text-[var(--ink)]">
                                          {fmt(s.startDate)} · {s.departureTime}
                                        </span>
                                        <span className="block text-[11px] text-[var(--ink-muted)]">
                                          {s.route ? `${s.route} · ` : ''}
                                          {s.bookedTravelers}/{s.maxTravelers} seats booked
                                          {s.vehicles.length ? ` · ${s.vehicles.length} vehicle${s.vehicles.length === 1 ? '' : 's'}` : ''}
                                          {s.note ? ` · ${s.note}` : ''}
                                        </span>
                                      </span>
                                    </div>
                                    <input
                                      type="radio"
                                      name="departure"
                                      value={s.slotId}
                                      checked={selected}
                                      disabled={s.isFull}
                                      onChange={() => {
                                        setSelectedSlotId(s.slotId);
                                        setStartDate(s.startDate);
                                      }}
                                      className="sr-only"
                                    />
                                    <span
                                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                                        s.isFull
                                          ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
                                          : room
                                            ? 'bg-[var(--success-soft)] text-[var(--success)]'
                                            : 'bg-[var(--warning-soft)] text-[var(--warning)]'
                                      }`}
                                    >
                                      {s.status === 'CLOSED' ? 'Closed' : s.isFull ? 'Fully booked' : room ? `${s.spotsLeft} left` : `Max ${s.maxGroup} together`}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--ink-secondary)]">
                              No departures are scheduled for this tour yet.{' '}
                              <a href={`/quote/request?tourId=${encodeURIComponent(tourId)}`} className="font-semibold text-[var(--brand-ink)] underline">
                                Request a quote
                              </a>{' '}
                              and the operator will propose dates.
                            </div>
                          )}
                          {hasSlots && list.every((s) => s.isFull) && (
                            <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                              Every departure is fully booked or closed. New dates appear here as soon as the operator adds them.
                            </p>
                          )}
                        </div>

                        {/* Travellers */}
                        <div>
                          <span className="form-label">Travellers</span>
                          <div className="space-y-2">
                            {(
                              [
                                ['Adults', adults, setAdults, 1, 12],
                                ['Children (under 12)', children, setChildren, 0, 8],
                              ] as const
                            ).map(([label, value, setter, min, max]) => (
                              <div
                                key={label}
                                className="flex items-center justify-between rounded-2xl border border-[var(--border)] px-3.5 py-3"
                              >
                                <div>
                                  <div className="text-sm font-semibold text-[var(--ink)]">{label}</div>
                                  <div className="text-[11px] text-[var(--ink-muted)]">
                                    {label.startsWith('Children') ? '50% of adult rate' : 'Full rate'}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    aria-label={`Fewer ${label}`}
                                    onClick={() => setter(Math.max(min, value - 1))}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--ink-secondary)] transition hover:border-[var(--brand)] hover:text-[var(--brand-ink)]"
                                  >
                                    <Minus className="h-3.5 w-3.5" />
                                  </button>
                                  <span className="w-6 text-center text-sm font-bold text-[var(--ink)]">{value}</span>
                                  <button
                                    type="button"
                                    aria-label={`More ${label}`}
                                    onClick={() => setter(Math.min(max, value + 1))}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--ink-secondary)] transition hover:border-[var(--brand)] hover:text-[var(--brand-ink)]"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 rounded-2xl bg-[var(--surface-sunk)] px-4 py-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[var(--ink-secondary)]">
                                {requestedPax} traveller{requestedPax !== 1 ? 's' : ''}
                              </span>
                              <strong className="text-lg text-[var(--ink)]">
                                ${Math.round(estimate).toLocaleString()}
                              </strong>
                            </div>
                            <p className="mt-1 text-[11px] text-[var(--ink-muted)]">
                              Estimate at list price · the agency confirms the final rate.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ── Step 2 ── */
                      <div className="grid gap-6 md:grid-cols-[1.35fr_1fr]">
                        <div>
                          <label htmlFor="res-notes" className="form-label">
                            Anything we should know? (optional)
                          </label>
                          <div className="mb-2 flex flex-wrap gap-1.5">
                            {QUICK_NOTES.map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => addNote(n)}
                                className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ink-secondary)] transition-colors hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-ink)]"
                              >
                                + {n}
                              </button>
                            ))}
                          </div>
                          <textarea
                            id="res-notes"
                            rows={5}
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            placeholder="Dietary requirements, accessibility, celebrating something, room arrangements…"
                            className="form-control resize-none"
                          />
                          <p className="mt-2 flex items-start gap-1.5 text-[11px] text-[var(--ink-muted)]">
                            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[var(--brand)]" />
                            No payment now — the agency reviews your request and confirms availability first.
                          </p>
                        </div>

                        {/* Review */}
                        <div>
                          <span className="form-label">Your request</span>
                          <dl className="space-y-2.5 rounded-2xl border border-[var(--border)] bg-[#FCFBF7] p-4 text-sm">
                            <div className="flex justify-between gap-3">
                              <dt className="text-[var(--ink-secondary)]">Departure</dt>
                              <dd className="text-right font-semibold text-[var(--ink)]">
                                {hasSlots && activeSlot ? `${fmt(activeSlot.startDate)} · ${activeSlot.departureTime}` : startDate ? fmt(startDate) : '—'}
                              </dd>
                            </div>
                            <div className="flex justify-between gap-3">
                              <dt className="text-[var(--ink-secondary)]">Travellers</dt>
                              <dd className="font-semibold text-[var(--ink)]">
                                {adults} adult{adults !== 1 ? 's' : ''}
                                {children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}
                              </dd>
                            </div>
                            {hasSlots && activeSlot && (
                              <div className="flex justify-between gap-3">
                                <dt className="text-[var(--ink-secondary)]">Seats left</dt>
                                <dd className="font-semibold text-[var(--success)]">{activeSlot.spotsLeft}</dd>
                              </div>
                            )}
                            <div className="flex justify-between gap-3 border-t border-[var(--border-soft)] pt-2.5">
                              <dt className="text-[var(--ink-secondary)]">Estimated total</dt>
                              <dd className="text-base font-bold text-[var(--ink)]">
                                ${Math.round(estimate).toLocaleString()}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    )}

                    {/* ── Actions ── */}
                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-[var(--border-soft)] pt-4">
                      {step === 2 ? (
                        <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" disabled={loading}>
                          <ArrowLeft className="h-4 w-4" /> Back
                        </button>
                      ) : (
                        <span className="hidden items-center gap-1.5 text-[11px] text-[var(--ink-muted)] sm:flex">
                          <Users className="h-3.5 w-3.5" />
                          Requests go straight to the agency
                        </span>
                      )}

                      {step === 1 ? (
                        <button
                          type="button"
                          onClick={goNext}
                          disabled={!stepOneValid || loadingSlots}
                          className="btn btn-primary"
                        >
                          Continue <ArrowRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <button type="submit" disabled={loading} className="btn btn-primary">
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                          {loading ? 'Sending request…' : 'Send reservation request'}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
