'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLiveRefresh } from '@/lib/use-live';
import Link from 'next/link';
import { Calendar, ChevronRight, ShieldCheck, Users } from 'lucide-react';
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
  departureTime: string;
  maxTravelers: number;
  bookedTravelers: number;
  spotsLeft: number;
  isFull: boolean;
}

const fmtDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

export default function BookingBox({ tourId, tourTitle, minPriceUsd, maxPrice, dbTourId }: BookingBoxProps) {
  const [slots, setSlots] = useState<SlotInfo[] | null>(null);

  const effectiveId = dbTourId || tourId;
  const load = useCallback(() => {
    if (!effectiveId) return;
    fetch(`/api/tours/${effectiveId}/slots`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSlots(Array.isArray(d?.availability) ? d.availability : []))
      .catch(() => setSlots((prev) => prev ?? []));
  }, [effectiveId]);

  useEffect(() => {
    load();
  }, [load]);

  useLiveRefresh(effectiveId ? `tour=${encodeURIComponent(effectiveId)}` : null, load);

  const loadingSlots = slots === null;
  const openDepartures = (slots ?? []).filter((s) => !s.isFull);
  const next = openDepartures[0] ?? null;
  const totalSeatsLeft = openDepartures.reduce((sum, s) => sum + s.spotsLeft, 0);

  return (
    <div className="rounded-3xl border border-[var(--glass-border)] bg-white p-6 shadow-[0_18px_44px_rgba(1,45,50,0.10)] font-sans">
      {/* ── Price ── */}
      <div className="flex items-end justify-between gap-3 border-b border-[var(--border-soft)] pb-4">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-deep)]">
            From
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold leading-none tracking-tight text-[var(--brand-deep)]">
              ${minPriceUsd.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-[var(--ink)]">pp</span>
          </div>
        </div>
        <div className="text-right text-xs font-semibold text-[var(--ink-secondary)] whitespace-nowrap">
          <div>up to ${maxPrice.toLocaleString()} pp</div>
          <div className="text-[11px] text-[#516D6A] font-normal">per person sharing</div>
        </div>
      </div>

      {/* ── Live availability ── */}
      <div className="space-y-3 py-4">
        {loadingSlots ? (
          <>
            <div className="h-14 animate-pulse rounded-2xl bg-[var(--surface-sunk)]" />
            <div className="h-9 w-2/3 animate-pulse rounded-full bg-[var(--surface-sunk)]" />
          </>
        ) : next ? (
          <>
            <div className="flex items-center gap-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-sunk)] p-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-deep)] font-extrabold">
                <Calendar className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-deep)]">
                  Next departure
                </div>
                <div className="truncate text-sm sm:text-base font-bold text-[var(--ink)]">{fmtDate(next.startDate)} · {next.departureTime}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  next.spotsLeft <= 2
                    ? 'bg-[var(--warning-soft)] text-[var(--warning)]'
                    : 'bg-[var(--success-soft)] text-[var(--success)]'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                {next.spotsLeft} spot{next.spotsLeft === 1 ? '' : 's'} left on this date
              </span>
              {openDepartures.length > 1 && (
                <span className="rounded-full bg-[var(--surface-sunk)] px-3 py-1 text-xs font-bold text-[var(--ink)]">
                  {openDepartures.length} departures · {totalSeatsLeft} seats
                </span>
              )}
            </div>
          </>
        ) : (slots ?? []).length > 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--danger)]">
              <Calendar className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-bold text-[var(--danger)]">All departures fully booked</div>
              <div className="text-xs text-[var(--ink)] mt-0.5">
                Every scheduled departure is sold out. New dates appear as soon as the agency adds them.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-sunk)] text-[var(--ink)]">
              <Calendar className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-bold text-[var(--ink)]">No departures scheduled yet</div>
              <div className="text-xs text-[var(--ink-secondary)] mt-0.5">
                Request a quote and the operator will propose dates.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="space-y-3 pt-2">
        <ReserveDialog tourId={dbTourId || tourId} tourTitle={tourTitle} minPriceUsd={minPriceUsd} />
        <Link
          href={`/quote/request?tourId=${encodeURIComponent(tourId)}`}
          className="btn btn-secondary w-full text-sm font-bold py-3"
        >
          Request a quote instead <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <ul className="mt-5 space-y-2.5 border-t border-[var(--border-soft)] pt-4 text-xs sm:text-[13px] text-[var(--ink)] font-medium">
        <li className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
          <span>
            <Link href="/best-price-guarantee" className="font-bold text-[var(--brand-deep)] hover:underline">
              Best price guarantee
            </Link>{' '}
            — direct local booking, 0% commission
          </span>
        </li>
        <li className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
          <span>No payment now — the agency confirms your date first</span>
        </li>
        <li className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
          <span>
            Or{' '}
            <Link href="/contact-us" className="font-bold text-[var(--brand-deep)] hover:underline">
              contact the agency
            </Link>{' '}
            directly
          </span>
        </li>
      </ul>
    </div>
  );
}
