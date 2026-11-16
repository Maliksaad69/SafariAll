'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Compass } from 'lucide-react';
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

const ANIMATION_CLASSES = [
  'ken-burns-in',
  'ken-burns-right',
  'ken-burns-out',
  'ken-burns-left',
];

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
  autoPlayInterval = 6000,
  showLocationBadge = true,
  children,
  className = '',
  minHeightClass = 'min-h-[560px] sm:min-h-[584px] lg:min-h-[620px]',
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
      className={`relative w-full overflow-hidden flex items-center ${minHeightClass} ${className}`}
    >
      {/* ── Top Dynamic Slide Progress Indicator ── */}
      <div className="absolute top-0 left-0 right-0 h-1 z-30 bg-black/35 overflow-hidden">
        <div
          key={currentIndex}
          className="h-full bg-gradient-to-r from-[#123b34] via-[#e78748] to-[#f6bd91] hero-progress-bar shadow-[0_0_8px_rgba(231,135,72,0.8)]"
          style={{ animationDuration: `${autoPlayInterval}ms` }}
        />
      </div>

      {/* ── Background Crossfading Images with Cinematic Animations ── */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {resolvedSlides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const isLoaded = loadedIndices.includes(idx);
          const animClass = ANIMATION_CLASSES[idx % ANIMATION_CLASSES.length];
          return (
            <div
              key={slide.url}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div
                className={`w-full h-full bg-cover bg-center ${
                  isActive ? animClass : 'scale-100'
                }`}
                style={isLoaded ? { backgroundImage: `url('${slide.url}')` } : undefined}
              />
            </div>
          );
        })}

        {/* ── Layered Directional Contrast Scrims ── */}
        {/* Desktop directional scrim (dark on left, sheer on right) */}
        <div
          className="hidden md:block absolute inset-0 z-15"
          style={{
            background:
              'linear-gradient(90deg, rgba(8,34,30,0.92) 0%, rgba(8,34,30,0.72) 48%, rgba(8,34,30,0.18) 100%)',
          }}
        />
        {/* Mobile vertical scrim */}
        <div
          className="md:hidden absolute inset-0 z-15"
          style={{
            background:
              'linear-gradient(180deg, rgba(8,34,30,0.92) 0%, rgba(8,34,30,0.78) 55%, rgba(8,34,30,0.92) 100%)',
          }}
        />
      </div>

      {/* ── Top Floating Location Badge ── */}
      <div className="absolute top-4 right-4 sm:right-8 z-30">
        {showLocationBadge && currentSlide && (
          <div
            key={currentSlide.location}
            className="animate-fade-up flex items-center gap-1.5 rounded-full border border-white/20 bg-[#0b2926]/75 px-3 py-1 backdrop-blur-md shadow-md"
          >
            <Compass className="h-3.5 w-3.5 text-[#e78748] shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-extrabold text-[#f4f7f3] tracking-wider uppercase">
              {currentSlide.location}
            </span>
          </div>
        )}
      </div>

      {/* ── Foreground Content ── */}
      {children ? (
        <div className="relative z-20 w-full h-full flex flex-col justify-between py-6 px-3 sm:px-4 md:py-0 md:px-0">
          {children}
        </div>
      ) : (
        <div className="relative z-20 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="max-w-[830px]">
            {/* Eyebrow with dash */}
            <div className="flex items-center gap-2.5 text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.17em] text-[#f4ba8e] mb-4 sm:mb-5">
              <span className="w-6 h-[2px] bg-[#e78748] shrink-0" />
              <span>AFRICA&apos;S MARKETPLACE FOR SAFARI TOURS</span>
            </div>

            {/* Heading */}
            <h1 className="font-display font-extrabold text-[36px] sm:text-[50px] md:text-[62px] lg:text-[72px] leading-[1.06] tracking-[-1.8px] sm:tracking-[-2.5px] text-white mb-5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
              Your next safari<br className="hidden sm:inline" /> starts with{' '}
              <span className="text-[#f3ae7d]">hello.</span>
            </h1>

            {/* Description */}
            <p className="text-[15px] sm:text-[17px] leading-[1.65] max-w-[580px] text-[#e5ece7] mb-7 sm:mb-8 font-normal drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">
              Explore extraordinary African safaris, compare authentic tours, and connect directly with trusted local operators. The adventure is yours to discover.
            </p>

            {/* CTA Button */}
            <div>
              <Link
                href="/african-safari-tours"
                className="inline-flex items-center justify-center gap-2 bg-[#e78748] hover:bg-[#d87638] text-[#0b2926] font-extrabold text-sm sm:text-[15px] px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl shadow-xl transition-all active:scale-[0.98]"
              >
                Find Your Perfect Safari &nbsp; ↗
              </Link>
            </div>

            {/* Feature Check Chips */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white text-xs sm:text-[13px] font-bold mt-7 sm:mt-8">
              <span className="flex items-center gap-2">
                <b className="text-[#f2aa78] font-black text-sm">✓</b> Direct local quotes
              </span>
              <span className="flex items-center gap-2">
                <b className="text-[#f2aa78] font-black text-sm">✓</b> Explore 13 African countries
              </span>
              <span className="flex items-center gap-2">
                <b className="text-[#f2aa78] font-black text-sm">✓</b> No booking commission
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
