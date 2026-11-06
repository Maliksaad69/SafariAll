'use client';


import { MapPin } from 'lucide-react';

export interface HeroSlide {
  url: string;
  location: string;
  caption?: string;
  badge?: string;
  title?: string;
  titleHighlight?: string;
  subtitle?: string;
}

export function getDefaultHeroSlides(tourCount?: number): HeroSlide[] {
  const countStr = tourCount ? tourCount.toLocaleString() : '1,500+';
  return [
    {
      url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2560&q=85',
      location: 'Serengeti National Park · Tanzania',
      badge: 'Zero Commission · Direct Local Quotes',
      title: `Compare ${countStr} African`,
      titleHighlight: 'Safari Tours',
      subtitle: 'Booked directly from top-rated verified local operators at true local prices',
    },
    {
      url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=2560&q=85',
      location: 'Amboseli National Park · Kenya',
      badge: 'Iconic Landscapes · Amboseli & Tsavo',
      title: 'Walk Alongside Giant',
      titleHighlight: 'Elephant Herds',
      subtitle: 'Witness world-famous tuskers beneath the snow-capped peak of Mount Kilimanjaro',
    },
    {
      url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=2560&q=85',
      location: 'Maasai Mara National Reserve · Kenya',
      badge: 'Big Cat Encounters · Maasai Mara',
      title: 'Witness The Great',
      titleHighlight: 'Wildebeest Migration',
      subtitle: 'Dramatic Mara River crossings, apex predator stalks, and golden savannah plains',
    },
    {
      url: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2560&q=85',
      location: 'Okavango Delta · Botswana',
      badge: 'Pristine Wetlands · Okavango Delta',
      title: 'Glide Through Untamed',
      titleHighlight: 'Okavango Channels',
      subtitle: 'Traverse silent papyrus waterways by traditional mokoro canoe in Botswana',
    },
    {
      url: 'https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?auto=format&fit=crop&w=2560&q=85',
      location: 'Greater Kruger & Sabi Sand · South Africa',
      badge: 'Premier Reserves · Greater Kruger',
      title: 'Track Elusive Leopards &',
      titleHighlight: 'The Big Five',
      subtitle: 'Spot Africa’s apex wildlife with top-tier rangers and luxury safari lodges',
    },
    {
      url: 'https://images.unsplash.com/photo-1551776235-dde6d482980b?auto=format&fit=crop&w=2560&q=85',
      location: 'Bwindi Impenetrable Forest · Uganda',
      badge: 'Ancient Rainforest · Bwindi & Volcanoes',
      title: 'Stand Face-to-Face With',
      titleHighlight: 'Mountain Gorillas',
      subtitle: 'An intimate, life-changing encounter deep inside the misty rainforest canopy',
    },
    {
      url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=2560&q=85',
      location: 'Tarangire & Serengeti · Tanzania',
      badge: 'Sunset Wilderness · Tarangire & Serengeti',
      title: 'Silhouetted Giraffes On',
      titleHighlight: 'Golden Savannas',
      subtitle: 'Experience incandescent African sunsets across vast acacia and baobab plains',
    },
    {
      url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=2560&q=85',
      location: 'Ngorongoro Crater · Tanzania',
      badge: 'UNESCO World Heritage · Ngorongoro',
      title: 'Descend Into The World’s',
      titleHighlight: 'Wildest Caldera',
      subtitle: 'Unrivaled predator density and black rhinos in a majestic volcanic amphitheater',
    },
  ];
}

const ANIMATION_CLASSES = [
  'ken-burns-in',
  'ken-burns-right',
  'ken-burns-out',
  'ken-burns-left',
];

interface HeroBackgroundSliderProps {
  slides?: HeroSlide[];
  tourCount?: number;
  autoPlayInterval?: number;
  showLocationBadge?: boolean;
  showControls?: boolean;
  children?: React.ReactNode;
  className?: string;
  minHeightClass?: string;
}

export default function HeroBackgroundSlider({
  slides,
  tourCount,
  showLocationBadge = true,
  children,
  className = '',
  minHeightClass = 'h-[460px] min-h-[460px]',
}: HeroBackgroundSliderProps) {
  const resolvedSlides = slides || getDefaultHeroSlides(tourCount);
  const currentSlide = resolvedSlides[0];

  return (
    <section
      aria-label="African Safari Hero Banner"
      className={`relative w-full overflow-hidden flex flex-col justify-between pt-3.5 pb-3.5 px-3 sm:px-4 md:pt-0 md:pb-0 md:px-0 md:block ${minHeightClass} ${className}`}
    >
      {/* ── Stable Hero Background Photography ── */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${currentSlide.url}')` }}
        />

        {/* ── Layered Contrast Scrims ── */}
        <div className="absolute inset-0 bg-black/40 z-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/25 to-black/85 z-15" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--brand-deep)]/35 via-transparent to-[var(--brand)]/20 z-15" />
      </div>

      {/* ── Top Floating Location Badge ── */}
      <div className="absolute top-3.5 sm:top-4 right-3 sm:right-6 z-30 flex items-center gap-2">
        {showLocationBadge && currentSlide && (
          <div
            key={currentSlide.location}
            className="animate-fade-up hidden sm:flex items-center gap-1.5 rounded-full border border-white/25 bg-black/55 px-3 py-1 backdrop-blur-md shadow-md"
          >
            <MapPin className="h-3 w-3 text-[var(--gold)] shrink-0 animate-pulse" />
            <span className="text-[11px] font-bold text-white tracking-wide drop-shadow-sm">
              {currentSlide.location}
            </span>
          </div>
        )}
      </div>

      {/* ── Text Hero Foreground ── */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1230px] flex-col items-center justify-center text-center px-3 sm:px-6 md:h-full md:pb-24 pt-1 sm:pt-4 md:pt-0">
        <div
          key={currentSlide.location || 'hero'}
          className="max-w-3xl text-center text-white"
        >
          {/* Animated Highlight Badge with Orange Blink */}
          {currentSlide.badge && (
            <span className="mb-1.5 sm:mb-2.5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7A00]" />
              </span>
              {currentSlide.badge}
            </span>
          )}

          {/* Dynamic Headline with Vibrant Accent */}
          <h1 className="text-[21px] sm:text-[30px] md:text-[38px] lg:text-[42px] font-bold leading-[1.14] tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.65)] font-display">
            {currentSlide.title}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFDF5] via-[#E4DBB4] to-[#C9B98A] drop-shadow-[0_2px_12px_rgba(25,58,56,0.5)]">
              {currentSlide.titleHighlight}
            </span>
          </h1>

          {/* Dynamic Subtitle */}
          {currentSlide.subtitle && (
            <p className="mx-auto mt-1 sm:mt-2 max-w-xl text-[11.5px] sm:text-sm md:text-base font-medium leading-relaxed text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
              {currentSlide.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ── Hero Foreground Extras (Search Form) ── */}
      {children}
    </section>
  );
}
