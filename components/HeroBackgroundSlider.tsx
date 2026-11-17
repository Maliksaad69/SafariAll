'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Compass, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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
  return [
    {
      url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=75',
      location: 'Serengeti National Park · Tanzania',
      badge: 'Zero Commission · Direct Local Quotes',
      title: 'Compare African',
      titleHighlight: 'Safari Tours',
      subtitle: 'Booked directly from top-rated verified local operators at true local prices',
    },
    {
      url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1600&q=75',
      location: 'Amboseli National Park · Kenya',
      badge: 'Iconic Landscapes · Amboseli & Tsavo',
      title: 'Walk Alongside Giant',
      titleHighlight: 'Elephant Herds',
      subtitle: 'Witness world-famous tuskers beneath the snow-capped peak of Mount Kilimanjaro',
    },
    {
      url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1600&q=75',
      location: 'Maasai Mara National Reserve · Kenya',
      badge: 'Big Cat Encounters · Maasai Mara',
      title: 'Witness The Great',
      titleHighlight: 'Wildebeest Migration',
      subtitle: 'Dramatic Mara River crossings, apex predator stalks, and golden savannah plains',
    },
    {
      url: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1600&q=75',
      location: 'Okavango Delta · Botswana',
      badge: 'Pristine Wetlands · Okavango Delta',
      title: 'Glide Through Untamed',
      titleHighlight: 'Okavango Channels',
      subtitle: 'Traverse silent papyrus waterways by traditional mokoro canoe in Botswana',
    },
    {
      url: 'https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?auto=format&fit=crop&w=1600&q=75',
      location: 'Greater Kruger & Sabi Sand · South Africa',
      badge: 'Premier Reserves · Greater Kruger',
      title: 'Track Elusive Leopards &',
      titleHighlight: 'The Big Five',
      subtitle: 'Spot Africa’s apex wildlife with top-tier rangers and luxury safari lodges',
    },
    {
      url: 'https://images.unsplash.com/photo-1551776235-dde6d482980b?auto=format&fit=crop&w=1600&q=75',
      location: 'Bwindi Impenetrable Forest · Uganda',
      badge: 'Ancient Rainforest · Bwindi & Volcanoes',
      title: 'Stand Face-to-Face With',
      titleHighlight: 'Mountain Gorillas',
      subtitle: 'An intimate, life-changing encounter deep inside the misty rainforest canopy',
    },
    {
      url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1600&q=75',
      location: 'Tarangire National Park · Tanzania',
      badge: 'Sunset Wilderness · Tarangire',
      title: 'Silhouetted Giraffes On',
      titleHighlight: 'Golden Savannas',
      subtitle: 'Experience incandescent African sunsets across vast acacia and baobab plains',
    },
    {
      url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1600&q=75',
      location: 'Ngorongoro Crater · Tanzania',
      badge: 'UNESCO World Heritage · Ngorongoro',
      title: 'Descend Into The World’s',
      titleHighlight: 'Wildest Caldera',
      subtitle: 'Unrivaled predator density and black rhinos in a majestic volcanic amphitheater',
    },
  ];
}

export interface HeroBackgroundSliderProps {
  slides?: HeroSlide[];
  tourCount?: number;
  autoPlayInterval?: number;
  showLocationBadge?: boolean;
  children?: React.ReactNode;
  className?: string;
  minHeightClass?: string;
}

export default function HeroBackgroundSlider({
  slides,
  tourCount,
  autoPlayInterval = 7000,
  showLocationBadge = true,
  children,
  className = '',
  minHeightClass = 'min-h-[520px] sm:min-h-[580px] lg:min-h-[620px]',
}: HeroBackgroundSliderProps) {
  const resolvedSlides = slides || getDefaultHeroSlides(tourCount);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedIndices, setLoadedIndices] = useState<number[]>([0, 1]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % resolvedSlides.length;
        setLoadedIndices((current) => {
          const afterNext = (next + 1) % resolvedSlides.length;
          if (current.includes(next) && current.includes(afterNext)) return current;
          return Array.from(new Set([...current, next, afterNext]));
        });
        return next;
      });
    }, autoPlayInterval);
  }, [resolvedSlides.length, autoPlayInterval]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoPlay]);

  const currentSlide = resolvedSlides[currentIndex] || resolvedSlides[0];

  return (
    <section
      aria-label="African Safari Hero"
      className={`relative w-full overflow-hidden flex flex-col justify-center ${minHeightClass} ${className}`}
    >
      {/* ── Background Crossfading Images (Clean Naturalist Photography) ── */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {resolvedSlides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const isLoaded = loadedIndices.includes(idx);
          return (
            <div
              key={slide.url}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={isLoaded ? { backgroundImage: `url('${slide.url}')` } : undefined}
              />
            </div>
          );
        })}

        {/* ── Directional Contrast Scrims (Calm Dark Ground for Pure Legibility) ── */}
        <div
          className="hidden md:block absolute inset-0 z-15"
          style={{
            background:
              'linear-gradient(90deg, rgba(19,34,32,0.92) 0%, rgba(19,34,32,0.76) 52%, rgba(19,34,32,0.28) 100%)',
          }}
        />
        <div
          className="md:hidden absolute inset-0 z-15"
          style={{
            background:
              'linear-gradient(180deg, rgba(19,34,32,0.94) 0%, rgba(19,34,32,0.82) 65%, rgba(19,34,32,0.95) 100%)',
          }}
        />
      </div>

      {/* ── Location Badge (Quiet Naturalist Field Tag) ── */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-30 max-w-[calc(100vw-32px)]">
        {showLocationBadge && currentSlide && (
          <div
            key={currentSlide.location}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-[#132220]/80 px-3 py-1 backdrop-blur-sm"
          >
            <Compass className="h-3.5 w-3.5 text-[#E59E67] shrink-0" strokeWidth={1.5} />
            <span className="text-xs font-medium text-[#EAE6DB] truncate">
              {currentSlide.location}
            </span>
          </div>
        )}
      </div>

      {/* ── Foreground Content ── */}
      {children ? (
        <div className="relative z-20 w-full h-full flex flex-col justify-between py-6 px-4 md:py-0 md:px-0">
          {children}
        </div>
      ) : (
        <div className="relative z-20 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32">
          <div className="max-w-[760px]">
            {/* Category Eyebrow */}
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#E59E67] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E59E67]" />
              <span>Africa&apos;s safari marketplace</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-semibold text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.08] tracking-tight mb-4">
              Compare African safari tours and connect directly with local operators
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg leading-relaxed max-w-[600px] text-[#D8DFDC] mb-6 font-normal">
              Explore authentic safari itineraries across 13 countries. Request custom quotes directly from verified in-country specialists at true local rates.
            </p>

            {/* Action */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/african-safari-tours"
                className="btn bg-[#C9773B] hover:bg-[#B86930] text-white font-medium text-sm px-6 py-3 rounded-lg shadow-xs inline-flex items-center gap-2"
              >
                <span>Explore safari tours</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/top-safari-countries"
                className="btn bg-white/10 hover:bg-white/15 text-white border border-white/20 font-medium text-sm px-5 py-3 rounded-lg"
              >
                <span>View destinations</span>
              </Link>
            </div>

            {/* Value Highlights */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/90 text-xs sm:text-[13px] font-medium mt-8 pt-6 border-t border-white/10">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#E59E67] shrink-0" strokeWidth={2} /> Direct local quotes
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#E59E67] shrink-0" strokeWidth={2} /> 13 African destinations
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#E59E67] shrink-0" strokeWidth={2} /> Zero booking commission
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
