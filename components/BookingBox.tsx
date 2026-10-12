'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';
import ReserveDialog from '@/components/ReserveDialog';

interface BookingBoxProps {
  tourId: string;
  tourTitle: string;
  minPriceUsd: number;
  maxPrice: number;
  dbTourId?: string;
}

interface SlotInfo {
  slotId: string;
  startDate: string;
  maxTravelers: number;
  bookedTravelers: number;
  spotsLeft: number;
  isFull: boolean;
}

// Generate the next 8 months of 1st-of-month departure options (fallback when
// the agency has not published fixed departure slots)
function generateDepartures(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 8; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    options.push({ value: iso, label: label });
  }
  return options;
}

function monthKey(iso: string): string {
  return iso.slice(0, 7); // YYYY-MM
}

export default function BookingBox({ tourId, tourTitle, minPriceUsd, maxPrice, dbTourId }: BookingBoxProps) {
  const departures = useMemo(generateDepartures, []);
  const [slots, setSlots] = useState<SlotInfo[] | null>(null);
  const [slotError, setSlotError] = useState(false);
  const [departure, setDeparture] = useState(departures[0]?.value ?? '');
  const [travelers, setTravelers] = useState(2);

  // Load real published departures + live capacity for this tour
  useMemo(() => {
    const effectiveId = dbTourId || tourId;
    if (!effectiveId) return;
    fetch(`/api/tours/${effectiveId}/slots`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && Array.isArray(d.availability)) {
          // Only future departures
          const future = (d.availability as SlotInfo[]).filter((s) => new Date(s.startDate) >= new Date(new Date().toDateString()));
          setSlots(future.length > 0 ? future : d.availability as SlotInfo[]);
        } else {
          setSlots([]);
        }
      })
      .catch(() => setSlotError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbTourId, tourId]);

  const useSlots = slots && slots.length > 0;
  const selectedSlot = useSlots
    ? slots?.find((s) => s.startDate.slice(0, 10) === departure.slice(0, 10)) ?? null
    : null;
  const spotsLeft = selectedSlot ? selectedSlot.spotsLeft : null;
  const isFull = selectedSlot ? selectedSlot.isFull : false;

  const estimate = minPriceUsd * travelers;
  const quoteHref = `/quote/request?tourId=${encodeURIComponent(tourId)}&departure=${encodeURIComponent(departure)}&travelers=${travelers}`;

  return (
    <div className="surface-card p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="text-sm font-bold text-[var(--ink)]">Price (USD)</div>
        <div className="text-right">
          <span className="text-[22px] font-bold leading-none text-[var(--success)]">${minPriceUsd.toLocaleString()}</span>
          <div className="text-[11px] text-[var(--ink-secondary)]">to ${maxPrice.toLocaleString()}</div>
          <div className="text-[10px] font-semibold text-[var(--ink-muted)]">per person</div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="departure-select" className="form-label">Departure</label>
          <select
            id="departure-select"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            className="form-control"
          >
            {useSlots
              ? slots!.map((s) => {
                  const iso = s.startDate.slice(0, 10);
                  const label = new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
                  const suffix = s.isFull ? ' — FULL' : ` — ${s.spotsLeft} spot${s.spotsLeft === 1 ? '' : 's'} left`;
                  return (
                    <option key={s.slotId} value={iso}>{label}{suffix}</option>
                  );
                })
              : departures.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
          </select>
        </div>

        {/* Capacity strip — real fullness from the agency's slot management */}
        {useSlots && selectedSlot && (
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
              isFull
                ? 'border-[rgba(185,28,28,0.25)] bg-[var(--danger-soft)] text-[var(--danger)]'
                : (spotsLeft ?? 99) <= 2
                  ? 'border-[rgba(180,120,20,0.25)] bg-[var(--warning-soft)] text-[#8a5a00]'
                  : 'border-[rgba(22,101,52,0.25)] bg-[var(--success-soft)] text-[var(--success)]'
            }`}
            role="status"
          >
            <Users className="h-3.5 w-3.5 shrink-0" />
            {isFull
              ? 'Fully booked — every seat on this departure is taken'
              : `${selectedSlot.bookedTravelers}/${selectedSlot.maxTravelers} travelers booked · ${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
          </div>
        )}

        <div>
          <label htmlFor="travelers-select" className="form-label">Travelers</label>
          <select
            id="travelers-select"
            value={travelers}
            onChange={(e) => setTravelers(Number(e.target.value))}
            className="form-control"
            disabled={isFull}
          >
            {(spotsLeft !== null
              ? Array.from({ length: Math.max(0, Math.min(8, spotsLeft)) }, (_, i) => i + 1)
              : [1, 2, 3, 4, 5, 6, 7, 8]
            ).map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'traveler' : 'travelers'}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 mt-4 flex justify-between items-center border-t border-[var(--border-soft)] pt-3 text-sm">
        <span className="text-[var(--ink-secondary)]">Estimated total</span>
        <strong className="text-base text-[var(--ink)]">${estimate.toLocaleString()}</strong>
      </div>

      <div className="space-y-2.5">
        {!isFull && (
          <Link href={quoteHref} className="btn btn-primary w-full">
            Request a Quote <ChevronRight className="h-4 w-4" />
          </Link>
        )}

        <ReserveDialog tourId={dbTourId || tourId} tourTitle={tourTitle} minPriceUsd={minPriceUsd} />
      </div>

      <ul className="mt-4 space-y-1.5 border-t border-[var(--border-soft)] pt-3 text-[11px] text-[var(--ink-secondary)]">
        <li className="flex items-start gap-1.5"><span className="mt-0.5 text-[var(--success)]">✓</span> <Link href="/best-price-guarantee" className="link">Best price guarantee</Link></li>
        <li className="flex items-start gap-1.5"><span className="mt-0.5 text-[var(--success)]">✓</span> Requests go directly to the agency</li>
        <li className="flex items-start gap-1.5"><span className="mt-0.5 text-[var(--success)]">✓</span> Or <Link href="/contact-us" className="link">contact</Link> the agency directly</li>
      </ul>
    </div>
  );
}
