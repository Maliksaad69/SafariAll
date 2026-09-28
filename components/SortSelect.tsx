'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface SortSelectProps {
  currentSort?: string;
}

export default function SortSelect({ currentSort = 'recommended' }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== 'recommended') {
      params.set('sort', val);
    } else {
      params.delete('sort');
    }
    router.push(`/tours?${params.toString()}`);
  };

  return (
    <select
      value={currentSort || 'recommended'}
      onChange={handleChange}
      className="w-full sm:w-auto bg-[var(--surface-page)] border border-[var(--border)] px-3.5 py-2 text-[13px] font-bold text-[var(--ink)] rounded-xl focus:outline-none focus:border-[var(--gold)] cursor-pointer shadow-2xs"
    >
      <option value="recommended">Featured Safaris</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="rating_desc">Top Rated Operators</option>
      <option value="duration_asc">Shortest Duration</option>
    </select>
  );
}
