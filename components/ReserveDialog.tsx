'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

interface Slot {
  slotId: string;
  startDate: string;
  maxTravelers: number;
  bookedTravelers: number;
  spotsLeft: number;
  isFull: boolean;
  note: string | null;
}

interface ReserveDialogProps {
  tourId: string;
  tourTitle: string;
  minPriceUsd: number;
}

export default function ReserveDialog({ tourId, tourTitle, minPriceUsd }: ReserveDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirmedRef, setConfirmedRef] = useState('');

  const estimate = minPriceUsd * adults + minPriceUsd * 0.5 * children;
  const today = new Date().toISOString().split('T')[0];
  const requestedPax = adults + children;

  useEffect(() => {
    if (!open || !tourId) return;
    setLoadingSlots(true);
    fetch(`/api/tours/${tourId}/slots`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.availability) && d.availability.length > 0) {
          const items = d.availability.map((a: Slot) => ({
            ...a,
            startDate: a.startDate.slice(0, 10),
          }));
          setSlots(items);
          const firstAvailable = items.find((s: Slot) => !s.isFull);
          if (firstAvailable) {
            setSelectedSlotId(firstAvailable.slotId);
            setStartDate(firstAvailable.startDate);
          }
        } else {
          setSlots([]);
        }
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [open, tourId]);

  const hasSlots = slots.length > 0;
  const activeSlot = hasSlots ? slots.find((s) => s.slotId === selectedSlotId) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let effectiveDate = startDate;
    let slotIdToSend: string | undefined = undefined;

    if (hasSlots) {
      if (!activeSlot) {
        setError('Please select an available departure slot.');
        return;
      }
      if (activeSlot.isFull) {
        setError(`This departure is fully booked (${activeSlot.bookedTravelers}/${activeSlot.maxTravelers} travelers confirmed).`);
        return;
      }
      if (requestedPax > activeSlot.spotsLeft) {
        setError(
          `Only ${activeSlot.spotsLeft} spot${activeSlot.spotsLeft === 1 ? '' : 's'} remain on this departure — your party of ${requestedPax} exceeds available capacity.`
        );
        return;
      }
      effectiveDate = activeSlot.startDate;
      slotIdToSend = activeSlot.slotId;
    } else {
      if (!effectiveDate) {
        setError('Please select your preferred departure date.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          startDate: effectiveDate,
          adultsCount: adults,
          childrenCount: children,
          specialRequests,
          slotId: slotIdToSend,
        }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit reservation request.');
      }

      setConfirmedRef(data.reservation?.reference || '');
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
    setSelectedSlotId('');
    setStartDate('');
    setAdults(2);
    setChildren(0);
    setSpecialRequests('');
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-secondary w-full">
        Request Reservation
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Request a reservation"
        >
          <div className="surface-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            {success ? (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--success-soft)] text-[var(--success)]">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
                  Reservation Request Sent!
                </h3>
                {confirmedRef && (
                  <p className="text-xs font-mono text-[var(--ink-secondary)]">Booking Ref: {confirmedRef}</p>
                )}
                <p className="text-sm text-[var(--ink-secondary)] max-w-sm mx-auto">
                  The safari agency has received your booking details and will review and message you directly in your trips dashboard.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button type="button" onClick={close} className="btn btn-secondary btn-sm">
                    Close
                  </button>
                  <button type="button" onClick={() => router.push('/my-trips')} className="btn btn-primary btn-sm">
                    View My Bookings
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
                      Request Reservation
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-[var(--ink-secondary)]">{tourTitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close dialog"
                    className="rounded-lg p-1.5 text-[var(--ink-secondary)] hover:bg-[var(--surface-sunk)] hover:text-[var(--ink)]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg border border-[rgba(185,28,28,0.25)] bg-[var(--danger-soft)] px-3 py-2 text-xs font-semibold text-[var(--danger)]">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Slots vs Date Picker */}
                  <div>
                    <label className="form-label">
                      {hasSlots ? 'Select Departure Date & Capacity' : 'Preferred Departure Date'}
                    </label>

                    {loadingSlots ? (
                      <div className="animate-pulse h-12 rounded-xl bg-[var(--surface-sunk)]" />
                    ) : hasSlots ? (
                      <div className="max-h-44 overflow-y-auto rounded-xl border border-[var(--border)] bg-white divide-y divide-[var(--border-soft)]">
                        {slots.map((s) => {
                          const isSelected = selectedSlotId === s.slotId;
                          const enoughRoom = s.spotsLeft >= requestedPax;
                          return (
                            <label
                              key={s.slotId}
                              className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                                s.isFull
                                  ? 'opacity-50 bg-red-50/40 cursor-not-allowed'
                                  : isSelected
                                    ? 'bg-[var(--surface-sunk)] border-l-4 border-[var(--brand)]'
                                    : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="radio"
                                  name="slot-choice"
                                  value={s.slotId}
                                  checked={isSelected}
                                  disabled={s.isFull}
                                  onChange={() => {
                                    setSelectedSlotId(s.slotId);
                                    setStartDate(s.startDate);
                                  }}
                                  className="h-4 w-4 text-[var(--brand)] focus:ring-[var(--brand)]"
                                />
                                <div>
                                  <div className="text-sm font-semibold text-[var(--ink)]">
                                    {new Date(`${s.startDate}T00:00:00Z`).toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      timeZone: 'UTC',
                                    })}
                                  </div>
                                  <div className="text-[11px] text-[var(--ink-secondary)]">
                                    {s.bookedTravelers}/{s.maxTravelers} booked
                                    {s.note ? ` · ${s.note}` : ''}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                {s.isFull ? (
                                  <span className="badge badge-danger text-[10px]">Fully Booked</span>
                                ) : !enoughRoom ? (
                                  <span className="badge badge-warning text-[10px]">
                                    Only {s.spotsLeft} spot{s.spotsLeft === 1 ? '' : 's'} left
                                  </span>
                                ) : (
                                  <span className="badge badge-success text-[10px]">
                                    {s.spotsLeft} spot{s.spotsLeft === 1 ? '' : 's'} left
                                  </span>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          id="res-date"
                          type="date"
                          required
                          min={today}
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="form-control"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="res-adults" className="form-label">
                        Adults
                      </label>
                      <select
                        id="res-adults"
                        value={adults}
                        onChange={(e) => setAdults(Number(e.target.value))}
                        className="form-control"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? 'adult' : 'adults'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="res-children" className="form-label">
                        Children (under 12)
                      </label>
                      <select
                        id="res-children"
                        value={children}
                        onChange={(e) => setChildren(Number(e.target.value))}
                        className="form-control"
                      >
                        {[0, 1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? 'child' : 'children'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="res-notes" className="form-label">
                      Special requests or requirements (optional)
                    </label>
                    <textarea
                      id="res-notes"
                      rows={2}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Dietary requirements, accessibility, room arrangements..."
                      className="form-control resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-[var(--surface-sunk)] px-3.5 py-2.5 text-sm">
                    <span className="text-[var(--ink-secondary)]">Estimated total ({requestedPax} traveler{requestedPax !== 1 ? 's' : ''})</span>
                    <strong className="text-base text-[var(--ink)]">${Math.round(estimate).toLocaleString()}</strong>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || (hasSlots && activeSlot?.isFull)}
                    className="btn btn-primary w-full"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {loading ? 'Submitting request...' : 'Send Reservation Request'}
                  </button>
                  <p className="text-center text-[11px] text-[var(--ink-muted)]">
                    Direct booking with {tourTitle.slice(0, 30)}... — Agency reviews and confirms your date.
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
