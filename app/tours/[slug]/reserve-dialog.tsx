'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Calendar, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Slot { slotId: string; startDate: string; maxTravelers: number; bookedTravelers: number; spotsLeft: number; isFull: boolean; note: string | null; }

interface Props {
  tourId: string;
  tourTitle: string;
  minPriceUsd: number;
}

export default function ReserveDialog({ tourId, tourTitle, minPriceUsd }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [startSlotId, setStartSlotId] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const estimate = minPriceUsd * adults + minPriceUsd * 0.5 * children;

  useEffect(() => {
    if (!tourId || !open) return;
    setLoadingSlots(true);
    fetch(`/api/tours/${tourId}/slots`)
      .then((r) => r.json())
      .then(({ availability }) => {
        const items = (availability || []).map((a: Slot) => ({
          ...a,
          startDate: a.startDate.slice(0, 10),
        }));
        setSlots(items);
        if (items.length === 1) setStartSlotId(items[0].slotId);
        setLoadingSlots(false);
      })
      .catch(() => setLoadingSlots(false));
  }, [tourId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slot = slots.find((s) => s.slotId === startSlotId);
    if (!slot) {
      setError('Please choose a departure date.');
      return;
    }
    const requestedPax = adults + children;
    if (requestedPax > slot.spotsLeft) {
      setError(slot.isFull
        ? `This departure is fully booked (${slot.bookedTravelers} of ${slot.maxTravelers} travelers already confirmed).`
        : `Only ${slot.spotsLeft} spot${slot.spotsLeft === 1 ? '' : 's'} remain on this departure — your group of ${requestedPax} exceeds capacity.`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          startDate: slot.startDate,
          adultsCount: adults,
          childrenCount: children,
          specialRequests,
          slotId: slot.slotId,
        }),
      });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit reservation request.');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setOpen(false);
    setSuccess(false);
    setError('');
    setStartSlotId('');
    setAdults(2);
    setChildren(0);
    setSpecialRequests('');
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-secondary w-full">Request Reservation</button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label="Request a reservation">
          <div className="surface-card w-full max-w-md p-6">
            {success ? (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--success-soft)] text-[var(--success)]"><CheckCircle2 className="h-7 w-7"/></div>
                <h3 className="text-xl font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>Request sent</h3>
                <p className="text-sm text-[var(--ink-secondary)]">The agency has received your reservation request and will confirm availability by email shortly.</p>
                <div className="flex justify-center gap-3 pt-2">
                  <button type="button" onClick={close} className="btn btn-secondary btn-sm">Close</button>
                  <button type="button" onClick={() => router.push('/tours')} className="btn btn-primary btn-sm">Continue Exploring</button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>Request Reservation</h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-[var(--ink-secondary)]">{tourTitle}</p>
                  </div>
                  <button type="button" onClick={close} aria-label="Close dialog" className="rounded-lg p-1.5 text-[var(--ink-secondary)] hover:bg-[var(--surface-sunk)] hover:text-[var(--ink)]"><X className="h-5 w-5"/></button>
                </div>

                {error && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg border border-[rgba(185,28,28,0.25)] bg-[var(--danger-soft)] px-3 py-2 text-xs font-semibold text-[var(--danger)]">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5"/> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="form-label">Departure date</label>
                    {loadingSlots ? (
                      <div className="animate-pulse h-9 rounded-xl bg-[var(--surface-sunk)]"/>
                    ) : slots.length === 0 ? (
                      <p className="text-sm text-[var(--ink-secondary)]">This package currently has no fixed departure dates. The agency will confirm a date when they review your request.</p>
                    ) : (
                      <div className="max-h-32 overflow-y-auto rounded-xl border border-[var(--border)] bg-white divide-y divide-[var(--border)]">
                        {slots.map((s) => {
                          const pax = adults + children;
                          const enoughRoom = s.spotsLeft >= pax;
                          return (
                            <label key={s.slotId} className="block px-3 py-2 cursor-pointer hover:bg-[var(--surface-sunk)]">
                              <input type="radio" name="departure" value={s.slotId} checked={startSlotId === s.slotId} disabled={s.isFull} className="sr-only" onChange={() => setStartSlotId(s.slotId)} />
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm text-[var(--ink)]">{new Date(s.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                  <div className="text-[11px] text-[var(--ink-secondary)]">
                                    {s.bookedTravelers} / {s.maxTravelers} travelers
                                    {s.note ? ` · ${s.note}` : ''}
                                  </div>
                                </div>
                                <div className="text-xs font-semibold">
                                  {s.isFull
                                    ? <span className="text-[var(--danger)]">Fully booked</span>
                                    : enoughRoom
                                      ? <span className="text-[var(--success)]">{s.spotsLeft} spot{s.spotsLeft === 1 ? '' : 's'} left</span>
                                      : <span className="text-[var(--warning)]">Not enough room for {pax}</span>
                                  }
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="res-adults" className="form-label">Adults</label>
                      <select id="res-adults" value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="form-control">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="res-children" className="form-label">Children</label>
                      <select id="res-children" value={children} onChange={(e) => setChildren(Number(e.target.value))} className="form-control">
                        {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="res-notes" className="form-label">Special requests (optional)</label>
                    <textarea
                      id="res-notes"
                      rows={2}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Dietary needs, celebrations, accessibility…"
                      className="form-control resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-[var(--surface-sunk)] px-3.5 py-2.5 text-sm">
                    <span className="text-[var(--ink-secondary)]">Estimated total</span>
                    <strong className="text-[var(--ink)]">${Math.round(estimate).toLocaleString()}</strong>
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-primary w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : null}
                    {loading ? 'Sending request…' : 'Send Reservation Request'}
                  </button>
                  <p className="text-center text-[11px] text-[var(--ink-muted)]">
                    No payment now — the agency confirms availability first.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
