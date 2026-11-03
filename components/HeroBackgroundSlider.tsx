'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Camera } from 'lucide-react';

export interface HeroSlide {
  url: string;
  location: string;
  caption?: string;
  credit?: string;
}

export const defaultHeroSlides: HeroSlide[] = [
  {
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2560&q=85',
    location: 'Serengeti National Park · Tanzania',
    caption: 'Majestic lion pride at golden hour on the endless plains',
  },
  {
    url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=2560&q=85',
    location: 'Amboseli National Park · Kenya',
    caption: 'Elephant herd beneath snow-capped Mount Kilimanjaro',
  },
  {
    url: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=2560&q=85',
    location: 'Bwindi Impenetrable Forest · Uganda',
    caption: 'Rare mountain gorilla in the ancient mist canopy',
  },
  {
    url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=2560&q=85',
    location: 'Maasai Mara National Reserve · Kenya',
    caption: 'Giraffes silhouetted against an African savanna sunset',
  },
  {
    url: 'https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?auto=format&fit=crop&w=2560&q=85',
    location: 'Greater Kruger & Sabi Sand · South Africa',
    caption: 'Solitary leopard resting in a leadwood tree at dawn',
  },
  {
    url: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=2560&q=85',
    location: 'Zanzibar Archipelago · Tanzania',
    caption: 'Turquoise Indian Ocean waters and traditional coastal dhows',
  },
];

interface HeroBackgroundSliderProps {
  slides?: HeroSlide[];
  autoPlayInterval?: number;
  showLocationBadge?: boolean;
  showControls?: boolean;
  children: React.ReactNode;
  className?: string;
  minHeightClass?: string;
}

export default function HeroBackgroundSlider({
  slides = defaultHeroSlides,
  autoPlayInterval = 6000,
  showLocationBadge = true,
  showControls = true,
  children,
  className = '',
  minHeightClass = 'min-h-[720px] sm:min-h-[700px] md:h-[600px]',
}: HeroBackgroundSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(nextSlide, autoPlayInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [nextSlide, autoPlayInterval, isPaused]);

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section
      aria-label="African Safari Hero Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full overflow-hidden flex flex-col justify-between pt-10 pb-8 px-3 sm:px-4 md:py-0 md:px-0 md:block ${minHeightClass} ${className}`}
    >
      {/* ── Background Crossfading Images with Ken Burns Zoom ── */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.url}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div
                className={`w-full h-full bg-cover bg-center transition-transform duration-[7500ms] ease-out will-change-transform ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                style={{ backgroundImage: `url('${slide.url}')` }}
              />
            </div>
          );
        })}

        {/* ── Layered Scrims for Text Readability ── */}
        <div className="absolute inset-0 bg-black/30 z-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/25 to-black/75 z-15" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--brand)]/20 via-transparent to-transparent z-15" />
      </div>

      {/* ── Floating Location Badge (Animated & Interactive) ── */}
      {showLocationBadge && currentSlide && (
        <div className="absolute top-5 right-4 sm:right-8 z-30 hidden sm:flex items-center gap-2 rounded-full border border-white/25 bg-black/45 px-3.5 py-1.5 backdrop-blur-md shadow-lg transition-all duration-500">
          <MapPin className="h-3.5 w-3.5 text-[var(--gold)] shrink-0 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide drop-shadow-sm">
            {currentSlide.location}
          </span>
        </div>
      )}

      {/* ── Hero Foreground Content (Titles, search form, CTAs) ── */}
      <div className="relative z-20 w-full h-full">
        {children}
      </div>

      {/* ── Controls & Slide Indicators ── */}
      {showControls && slides.length > 1 && (
        <div className="relative z-25 mx-auto max-w-[1230px] px-4 hidden md:flex items-center justify-between pointer-events-none pb-4 md:absolute md:bottom-2 md:left-1/2 md:-translate-x-1/2 md:w-full">
          {/* Slide Dots / Indicators */}
          <div className="flex items-center gap-2 pointer-events-auto bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                  i === currentIndex
                    ? 'w-7 bg-white shadow-xs'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md hover:bg-white hover:text-[var(--ink)] transition-all cursor-pointer shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md hover:bg-white hover:text-[var(--ink)] transition-all cursor-pointer shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
