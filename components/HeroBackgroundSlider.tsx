'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

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
  autoPlayInterval = 4800,
  showLocationBadge = true,
  showControls = true,
  children,
  className = '',
  minHeightClass = 'min-h-[460px] sm:min-h-[450px] md:h-[460px] lg:h-[480px]',
}: HeroBackgroundSliderProps) {
  const resolvedSlides = slides || getDefaultHeroSlides(tourCount);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % resolvedSlides.length);
    }, autoPlayInterval);
  }, [resolvedSlides.length, autoPlayInterval]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % resolvedSlides.length);
    startAutoPlay();
  }, [resolvedSlides.length, startAutoPlay]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + resolvedSlides.length) % resolvedSlides.length);
    startAutoPlay();
  }, [resolvedSlides.length, startAutoPlay]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    startAutoPlay();
  };

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoPlay]);

  const currentSlide = resolvedSlides[currentIndex] || resolvedSlides[0];

  return (
    <section
      aria-label="African Safari Hero Carousel"
      className={`relative w-full overflow-hidden flex flex-col justify-between pt-6 pb-6 px-3 sm:px-4 md:pt-0 md:pb-0 md:px-0 md:block ${minHeightClass} ${className}`}
    >
      {/* ── Top Dynamic Slide Progress Indicator ── */}
      <div className="absolute top-0 left-0 right-0 h-1 z-30 bg-black/35 overflow-hidden">
        <div
          key={currentIndex}
          className="h-full bg-gradient-to-r from-[var(--brand)] via-[#ff9b53] to-[var(--brand-strong)] hero-progress-bar shadow-[0_0_8px_rgba(244,119,53,0.8)]"
          style={{ animationDuration: `${autoPlayInterval}ms` }}
        />
      </div>

      {/* ── Background Crossfading Images with Cinematic Animations ── */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {resolvedSlides.map((slide, idx) => {
          const isActive = idx === currentIndex;
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
                style={{ backgroundImage: `url('${slide.url}')` }}
              />
            </div>
          );
        })}

        {/* ── Layered Contrast Scrims ── */}
        <div className="absolute inset-0 bg-black/40 z-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/25 to-black/85 z-15" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--brand-deep)]/35 via-transparent to-[var(--brand)]/20 z-15" />
      </div>

      {/* ── Top Floating Location Badge & Slide Counter ── */}
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

        {showControls && resolvedSlides.length > 1 && (
          <div className="flex items-center gap-1 rounded-full border border-white/20 bg-black/55 px-2 py-0.5 backdrop-blur-md text-white text-[11px] font-mono shadow-md">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="p-1 hover:text-[var(--brand)] transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <span className="px-0.5 text-white/90">
              {String(currentIndex + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(resolvedSlides.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="p-1 hover:text-[var(--brand)] transition-colors cursor-pointer"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* ── Changing Text Hero Foreground ── */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1230px] flex-col items-center justify-center text-center px-3 sm:px-4 md:h-full md:pb-24 pt-4 sm:pt-6 md:pt-2">
        <div
          key={currentIndex}
          className="animate-hero-text max-w-3xl text-center text-white"
        >
          {/* Animated Highlight Badge */}
          {currentSlide.badge && (
            <span className="mb-2 sm:mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md shadow-sm">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand)] animate-ping" />
              {currentSlide.badge}
            </span>
          )}

          {/* Dynamic Headline with Vibrant Accent */}
          <h1 className="text-[25px] sm:text-[34px] md:text-[42px] lg:text-[46px] font-bold leading-[1.12] tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.65)] font-display">
            {currentSlide.title}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffa463] via-[#F47735] to-[#ffbe8a] drop-shadow-[0_2px_12px_rgba(244,119,53,0.45)]">
              {currentSlide.titleHighlight}
            </span>
          </h1>

          {/* Dynamic Subtitle */}
          {currentSlide.subtitle && (
            <p className="mx-auto mt-1.5 sm:mt-2 max-w-xl text-xs sm:text-sm md:text-base font-medium leading-relaxed text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
              {currentSlide.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ── Hero Foreground Extras (Search Form) ── */}
      {children}

      {/* ── Bottom Slide Dots Indicator (Compact & Centered) ── */}
      {showControls && resolvedSlides.length > 1 && (
        <div className="relative z-25 mx-auto max-w-[1230px] px-4 hidden md:flex items-center justify-center pointer-events-none md:absolute md:bottom-1 md:left-1/2 md:-translate-x-1/2 md:w-full">
          <div className="flex items-center gap-1.5 pointer-events-auto bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-sm">
            {resolvedSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  i === currentIndex
                    ? 'w-6 bg-[var(--brand)] shadow-[0_0_6px_rgba(244,119,53,0.7)]'
                    : 'w-1.5 bg-white/40 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
