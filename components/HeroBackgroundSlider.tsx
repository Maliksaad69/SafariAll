'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

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
    caption: 'Majestic lion pride at golden hour across the boundless savanna',
  },
  {
    url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=2560&q=85',
    location: 'Amboseli National Park · Kenya',
    caption: 'Elephant herd beneath the snow-capped peak of Mount Kilimanjaro',
  },
  {
    url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=2560&q=85',
    location: 'Maasai Mara National Reserve · Kenya',
    caption: 'Sleek apex cheetah surveying the golden plains from a termite mound',
  },
  {
    url: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2560&q=85',
    location: 'Okavango Delta · Botswana',
    caption: 'Pristine waterways and floodplains teeming with untamed wildlife',
  },
  {
    url: 'https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?auto=format&fit=crop&w=2560&q=85',
    location: 'Greater Kruger & Sabi Sand · South Africa',
    caption: 'Solitary leopard resting in a leadwood tree branch at dawn',
  },
  {
    url: 'https://images.unsplash.com/photo-1551776235-dde6d482980b?auto=format&fit=crop&w=2560&q=85',
    location: 'Bwindi Impenetrable Forest · Uganda',
    caption: 'Rare mountain gorilla encounter deep inside the misty rainforest canopy',
  },
  {
    url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=2560&q=85',
    location: 'Tarangire & Serengeti · Tanzania',
    caption: 'Towering giraffes silhouetted against a radiant African sunset',
  },
  {
    url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=2560&q=85',
    location: 'Ngorongoro Crater · Tanzania',
    caption: 'Plains zebras grazing across the world’s largest intact caldera',
  },
];

const ANIMATION_CLASSES = [
  'ken-burns-in',
  'ken-burns-right',
  'ken-burns-out',
  'ken-burns-left',
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
  autoPlayInterval = 4800,
  showLocationBadge = true,
  showControls = true,
  children,
  className = '',
  minHeightClass = 'min-h-[720px] sm:min-h-[700px] md:h-[600px]',
}: HeroBackgroundSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);
  }, [slides.length, autoPlayInterval]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    startAutoPlay();
  }, [slides.length, startAutoPlay]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    startAutoPlay();
  }, [slides.length, startAutoPlay]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    startAutoPlay();
  };

  // Constantly switch images with no pause on general hover
  useEffect(() => {
    startAutoPlay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoPlay]);

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <section
      aria-label="African Safari Hero Carousel"
      className={`relative w-full overflow-hidden flex flex-col justify-between pt-10 pb-8 px-3 sm:px-4 md:py-0 md:px-0 md:block ${minHeightClass} ${className}`}
    >
      {/* ── Top Dynamic Slide Progress Indicator ── */}
      <div className="absolute top-0 left-0 right-0 h-1 z-30 bg-black/30 overflow-hidden">
        <div
          key={currentIndex}
          className="h-full bg-gradient-to-r from-[var(--brand)] via-[#ff9b53] to-[var(--brand-strong)] hero-progress-bar shadow-[0_0_8px_rgba(244,119,53,0.8)]"
          style={{ animationDuration: `${autoPlayInterval}ms` }}
        />
      </div>

      {/* ── Background Crossfading Images with Cinematic Animations ── */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {slides.map((slide, idx) => {
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
        <div className="absolute inset-0 bg-black/35 z-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-black/80 z-15" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--brand-deep)]/30 via-transparent to-[var(--brand)]/20 z-15" />
      </div>

      {/* ── Floating Animated Location Badge ── */}
      {showLocationBadge && currentSlide && (
        <div className="absolute top-5 right-4 sm:right-8 z-30 hidden sm:flex items-center gap-2">
          <div
            key={currentSlide.location}
            className="animate-fade-up flex items-center gap-2 rounded-full border border-white/25 bg-black/55 px-3.5 py-1.5 backdrop-blur-md shadow-lg"
          >
            <MapPin className="h-3.5 w-3.5 text-[var(--gold)] shrink-0 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide drop-shadow-sm">
              {currentSlide.location}
            </span>
          </div>
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
          <div className="flex items-center gap-2 pointer-events-auto bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                  i === currentIndex
                    ? 'w-7 bg-[var(--brand)] shadow-[0_0_8px_rgba(244,119,53,0.7)]'
                    : 'w-2 bg-white/40 hover:bg-white/80'
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
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-md hover:bg-[var(--brand)] hover:border-[var(--brand)] transition-all cursor-pointer shadow-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-md hover:bg-[var(--brand)] hover:border-[var(--brand)] transition-all cursor-pointer shadow-md"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
