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

/**
 * Sticky booking summary card.
 *
 * Deliberately a SUMMARY, not a form — the departure, party size and preferences
 * are collected once inside the ReserveDialog popup. Duplicating those controls
 * here (as the old version did) meant two places to set the same value.
 */
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
  // Seat counts update on screen as soon as anyone books, cancels or the agency changes a departure.
  useLiveRefresh(effectiveId ? `tour=${encodeURIComponent(effectiveId)}` : null, load);

  const loadingSlots = slots === null;
  const openDepartures = (slots ?? []).filter((s) => !s.isFull);
  const next = openDepartures[0] ?? null;
  const totalSeatsLeft = openDepartures.reduce((sum, s) => sum + s.spotsLeft, 0);

  return (
    <div className="rounded-3xl border border-[var(--glass-border)] bg-white p-5 shadow-[0_18px_44px_rgba(1,45,50,0.10)]">
      {/* ── Price ── */}
      <div className="flex items-end justify-between gap-3 border-b border-[var(--border-soft)] pb-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-ink)]">
            From
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-[30px] font-bold leading-none tracking-tight text-[var(--ink)]">
              ${minPriceUsd.toLocaleString()}
            </span>
            <span className="text-[13px] font-semibold text-[var(--ink-secondary)]">pp</span>
          </div>
        </div>
        <div className="text-right text-[11px] leading-relaxed text-[var(--ink-muted)]">
          up to ${maxPrice.toLocaleString()} pp
          <br />
          per person sharing
        </div>
      </div>

      {/* ── Live availability ── */}
      <div className="space-y-2.5 py-4">
        {loadingSlots ? (
          <>
            <div className="h-14 animate-pulse rounded-2xl bg-[var(--surface-sunk)]" />
            <div className="h-9 w-2/3 animate-pulse rounded-full bg-[var(--surface-sunk)]" />
          </>
        ) : next ? (
          <>
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[#FCFBF7] px-3.5 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-ink)]">
                <Calendar className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
                  Next departure
                </div>
                <div className="truncate text-sm font-bold text-[var(--ink)]">{fmtDate(next.startDate)} · {next.departureTime}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                  next.spotsLeft <= 2
                    ? 'bg-[var(--warning-soft)] text-[var(--warning)]'
                    : 'bg-[var(--success-soft)] text-[var(--success)]'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                {next.spotsLeft} spot{next.spotsLeft === 1 ? '' : 's'} left on this date
              </span>
              {openDepartures.length > 1 && (
                <span className="rounded-full bg-[var(--surface-sunk)] px-3 py-1 text-[11px] font-semibold text-[var(--ink-secondary)]">
                  {openDepartures.length} departures · {totalSeatsLeft} seats
                </span>
              )}
            </div>
          </>
        ) : (slots ?? []).length > 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3.5 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--danger)]">
              <Calendar className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-bold text-[var(--danger)]">All departures fully booked</div>
              <div className="text-[11px] text-[var(--ink-muted)]">
                Every scheduled departure is sold out or closed. New dates appear here as soon as the agency adds them.
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] px-3.5 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-sunk)] text-[var(--ink-secondary)]">
              <Calendar className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-bold text-[var(--ink)]">No departures scheduled yet</div>
              <div className="text-[11px] text-[var(--ink-muted)]">
                Request a quote and the operator will propose dates.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="space-y-2.5">
        <ReserveDialog tourId={dbTourId || tourId} tourTitle={tourTitle} minPriceUsd={minPriceUsd} />
        <Link
          href={`/quote/request?tourId=${encodeURIComponent(tourId)}`}
          className="btn btn-secondary w-full"
        >
          Request a quote instead <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <ul className="mt-4 space-y-2 border-t border-[var(--border-soft)] pt-4 text-[11px] text-[var(--ink-secondary)]">
        <li className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--brand)]" />
          <span>
            <Link href="/best-price-guarantee" className="link">
              Best price guarantee
            </Link>{' '}
            — booked direct, zero commission
          </span>
        </li>
        <li className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--brand)]" />
          <span>No payment now — the agency confirms your date first</span>
        </li>
        <li className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--brand)]" />
          <span>
            Or{' '}
            <Link href="/contact-us" className="link">
              contact the agency
            </Link>{' '}
            directly
          </span>
        </li>
      </ul>
    </div>
  );
}
