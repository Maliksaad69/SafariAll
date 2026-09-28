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

// Generate the next 8 months of 1st-of-month departure options
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

export default function BookingBox({ tourId, tourTitle, minPriceUsd, maxPrice, dbTourId }: BookingBoxProps) {
  const departures = useMemo(generateDepartures, []);
  const [departure, setDeparture] = useState(departures[0].value);
  const [travelers, setTravelers] = useState(2);

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
            {departures.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="travelers-select" className="form-label">Travelers</label>
          <select
            id="travelers-select"
            value={travelers}
            onChange={(e) => setTravelers(Number(e.target.value))}
            className="form-control"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
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
        <Link href={quoteHref} className="btn btn-primary w-full">
          Request a Quote <ChevronRight className="h-4 w-4" />
        </Link>

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
