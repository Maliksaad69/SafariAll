'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { SlidersHorizontal, RefreshCw, MapPin, Award, Clock, ArrowUpDown } from 'lucide-react';

interface FilterSidebarProps {
  currentCountry?: string;
  currentComfort?: string;
  currentDuration?: string;
  currentSort?: string;
}

export default function FilterSidebar({
  currentCountry = '',
  currentComfort = '',
  currentDuration = '',
  currentSort = 'recommended',
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(name, value);
      else params.delete(name);
      return params.toString();
    },
    [searchParams]
  );

  const handleParamChange = (name: string, value: string) => {
    router.push(`/tours?${createQueryString(name, value)}`);
  };

  const hasFilters = currentCountry || currentComfort || currentDuration;

  const countries = ['Tanzania', 'Kenya', 'South Africa', 'Uganda', 'Botswana', 'Zimbabwe', 'Rwanda'];
  const comfortTiers = [
    { label: 'Budget Camping', value: 'BUDGET' },
    { label: 'Mid-Range Lodge', value: 'MID_RANGE' },
    { label: 'Luxury Tented Camp', value: 'LUXURY' },
    { label: 'Fly-in Safari', value: 'FLY_IN' },
  ];
  const durations = [
    { label: '1–3 Days · Express', value: '1-3' },
    { label: '4–7 Days · Classic', value: '4-7' },
    { label: '8–14 Days · Grand', value: '8-14' },
    { label: '15+ Days · Expedition', value: '15+' },
  ];
  const sortOptions = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Duration', value: 'duration' },
  ];

  return (
    <aside
      className="w-full rounded-2xl overflow-hidden"
      style={{
        background: '#fff',
        border: '1px solid rgba(228,219,202,0.7)',
        boxShadow: '0 2px 16px rgba(28,17,8,0.06)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(228,219,202,0.7)' }}
      >
        <div
          className="flex items-center gap-2 font-semibold text-sm"
          style={{ fontFamily: 'var(--font-display, serif)', color: '#1C1108', fontSize: '1rem' }}
        >
          <SlidersHorizontal className="w-4 h-4" style={{ color: '#B8811A' }} />
          Filter Safaris
        </div>
        {hasFilters && (
          <button
            onClick={() => router.push('/tours')}
            className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-70"
            style={{ color: '#B8811A', fontFamily: 'var(--font-body)' }}
          >
            <RefreshCw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <div className="p-5 space-y-6">

        {/* Sort */}
        <FilterSection icon={ArrowUpDown} label="Sort By">
          <div className="space-y-1">
            {sortOptions.map((opt) => (
              <FilterRadio
                key={opt.value}
                name="sort"
                label={opt.label}
                value={opt.value}
                checked={currentSort === opt.value || (!currentSort && opt.value === 'recommended')}
                onChange={() => handleParamChange('sort', opt.value === 'recommended' ? '' : opt.value)}
              />
            ))}
          </div>
        </FilterSection>

        <Divider />

        {/* Country */}
        <FilterSection icon={MapPin} label="Destination">
          <div className="space-y-1">
            {countries.map((c) => (
              <FilterRadio
                key={c}
                name="country"
                label={c}
                value={c}
                checked={currentCountry === c}
                onChange={() => handleParamChange('country', currentCountry === c ? '' : c)}
              />
            ))}
          </div>
        </FilterSection>

        <Divider />

        {/* Comfort */}
        <FilterSection icon={Award} label="Safari Style">
          <div className="space-y-1">
            {comfortTiers.map((t) => (
              <FilterRadio
                key={t.value}
                name="comfort"
                label={t.label}
                value={t.value}
                checked={currentComfort === t.value}
                onChange={() => handleParamChange('comfort', currentComfort === t.value ? '' : t.value)}
              />
            ))}
          </div>
        </FilterSection>

        <Divider />

        {/* Duration */}
        <FilterSection icon={Clock} label="Duration">
          <div className="space-y-1">
            {durations.map((d) => (
              <FilterRadio
                key={d.value}
                name="duration"
                label={d.label}
                value={d.value}
                checked={currentDuration === d.value}
                onChange={() => handleParamChange('duration', currentDuration === d.value ? '' : d.value)}
              />
            ))}
          </div>
        </FilterSection>

      </div>
    </aside>
  );
}

function FilterSection({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#B8811A' }} />
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: '#6B5130', fontFamily: 'var(--font-body)' }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function FilterRadio({ name, label, value, checked, onChange }: {
  name: string; label: string; value: string; checked: boolean; onChange: () => void;
}) {
  return (
    <label
      className="flex items-center gap-3 text-sm cursor-pointer py-1.5 px-2 rounded-lg transition-colors"
      style={{
        color: checked ? '#1C1108' : '#6B5130',
        background: checked ? 'rgba(184,129,26,0.09)' : 'transparent',
        fontFamily: 'var(--font-body)',
        fontWeight: checked ? 600 : 400,
      }}
    >
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          border: checked ? '5px solid #B8811A' : '1.5px solid rgba(184,129,26,0.35)',
          background: checked ? '#B8811A' : 'transparent',
        }}
      />
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      {label}
    </label>
  );
}

function Divider() {
  return <div style={{ borderTop: '1px solid rgba(228,219,202,0.6)' }} />;
}
