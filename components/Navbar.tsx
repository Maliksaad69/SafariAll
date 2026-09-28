'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Heart,
  User,
  ChevronDown,
  Menu,
  X,
  Compass,
  MapPin,
  Building2,
  Tent,
  BookOpen,
  Home,
  Globe,
  DollarSign,
  UserPlus,
  LogIn,
} from 'lucide-react';
import NavbarSearch from '@/components/NavbarSearch';
import { safariOperators, safariTours } from '@/lib/site-data';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setSessionUser(d.user))
      .catch(() => setSessionUser(null));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSessionUser(null);
    setUserMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const res = await fetch('/api/favorites');
        if (!res.ok) return;
        const data = await res.json();
        setFavoriteCount(Array.isArray(data?.tours) ? data.tours.length : 0);
      } catch {
        setFavoriteCount(0);
      }
    };

    loadFavorites();

    const handleFavoritesUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ count?: number }>;
      const count = customEvent.detail?.count ?? 0;
      setFavoriteCount(count);
    };

    window.addEventListener('favorites:updated', handleFavoritesUpdate);
    return () => window.removeEventListener('favorites:updated', handleFavoritesUpdate);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href + '/'));

  // Safariopedia flag emojis for fast rendering
  const countryFlags: Record<string, string> = {
    Tanzania: '🇹🇿',
    Kenya: '🇰🇪',
    Uganda: '🇺🇬',
    Botswana: '🇧🇼',
    Rwanda: '🇷🇼',
    'South Africa': '🇿🇦',
    Zimbabwe: '🇿🇼',
    Zambia: '🇿🇲',
    Ethiopia: '🇪🇹',
    Namibia: '🇳🇦',
  };

  return (
    <header className="sticky top-0 z-50 font-sans shadow-md">
      {/* ── Upper Head Utility Bar (safariopedia.com upper-head) ── */}
      <div className="bg-[#1C1917] text-[#D4CBB8] text-xs py-1.5 border-b border-stone-800">
        <div className="mx-auto max-w-[1230px] px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <DollarSign className="w-3.5 h-3.5" />
              <span>USD $</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>English (EN)</span>
            </div>
          </div>

          <div className="flex items-center gap-4 font-semibold">
            {sessionUser ? (
              <div className="flex items-center gap-3">
                <span className="text-white">Hello, {sessionUser.name || sessionUser.email?.split('@')[0]}</span>
                <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 transition-colors">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="flex items-center gap-1 text-slate-200 hover:text-amber-400 transition-colors">
                  <LogIn className="w-3.5 h-3.5 text-amber-400" /> Login
                </Link>
                <span className="opacity-30">|</span>
                <Link href="/register" className="flex items-center gap-1 text-slate-200 hover:text-amber-400 transition-colors">
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" /> Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Navigation Bar ── */}
      <div className="bg-[var(--surface-card)]/95 backdrop-blur-md border-b border-[var(--border)]">
        <div className="mx-auto max-w-[1230px] px-4">
          <div className="flex h-[64px] items-center justify-between gap-4">
            {/* Logo from public folder */}
            <Link href="/" className="flex items-center flex-shrink-0 group">
              <div className="flex items-center gap-3">
                <img
                  src="/images/safaribuilt-logo.png"
                  alt="SafariBuilt Logo"
                  className="h-[38px] md:h-[44px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="hidden sm:flex flex-col border-l border-[var(--border-strong)] pl-3">
                  <span className="text-[18px] font-extrabold tracking-tight text-[var(--ink)] leading-none font-display">
                    Safari<span className="text-[var(--gold)]">Built</span>
                  </span>
                  <span className="text-[9.5px] font-bold uppercase tracking-widest text-[var(--gold)] leading-tight mt-0.5">
                    Safari Marketplace
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center flex-1 justify-center">
              <nav className="relative flex items-center gap-1.5 text-[13.5px] font-bold tracking-wide text-[var(--ink)]">
                {/* Home */}
                <Link
                  href="/"
                  className={`flex items-center gap-1.5 px-3 py-5 transition-colors border-b-2 ${
                    pathname === '/' ? 'text-[var(--gold)] border-[var(--gold)]' : 'border-transparent hover:text-[var(--gold)]'
                  }`}
                >
                  <Home className="w-4 h-4 text-[var(--gold)]" /> Home
                </Link>

                {/* Safaris & Tours */}
                <div
                  className="relative"
                  onMouseEnter={() => setOpenMenu('tours')}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Link
                    href="/tours"
                    className={`flex items-center gap-1.5 px-3 py-5 transition-colors border-b-2 ${
                      isActive('/tours') ? 'text-[var(--gold)] border-[var(--gold)]' : 'border-transparent hover:text-[var(--gold)]'
                    }`}
                  >
                    <Compass className="w-4 h-4 text-[var(--gold)]" /> Safaris &amp; Tours
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${openMenu === 'tours' ? 'rotate-180' : ''}`} />
                  </Link>

                  {openMenu === 'tours' && (
                    <div className="absolute left-0 top-full pt-1">
                      <div className="w-[240px] rounded-2xl border border-[var(--border)] bg-white p-2 shadow-xl">
                        {['Tanzania', 'Uganda', 'Kenya', 'Botswana', 'Rwanda', 'South Africa', 'Zimbabwe'].map((c) => (
                          <Link
                            key={c}
                            href={`/tours?country=${encodeURIComponent(c)}`}
                            onClick={() => setOpenMenu(null)}
                            className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-[var(--ink)] hover:bg-[var(--gold-soft)] hover:text-[var(--gold-ink)] transition-colors"
                          >
                            <span>{c} Safaris</span>
                            <span className="text-base">{countryFlags[c] || '🦁'}</span>
                          </Link>
                        ))}
                        <div className="border-t border-[var(--border-soft)] mt-1 pt-1">
                          <Link
                            href="/tours"
                            onClick={() => setOpenMenu(null)}
                            className="block rounded-xl px-3.5 py-2 text-[12px] font-extrabold text-[var(--gold)] hover:bg-[var(--surface-raised)]"
                          >
                            Browse All Tours →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Destinations */}
                <div
                  className="relative"
                  onMouseEnter={() => setOpenMenu('destinations')}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Link
                    href="/parks"
                    className={`flex items-center gap-1.5 px-3 py-5 transition-colors border-b-2 ${
                      isActive('/parks') ? 'text-[var(--gold)] border-[var(--gold)]' : 'border-transparent hover:text-[var(--gold)]'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-[var(--gold)]" /> Destinations
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${openMenu === 'destinations' ? 'rotate-180' : ''}`} />
                  </Link>

                  {openMenu === 'destinations' && (
                    <div className="absolute left-0 top-full pt-1">
                      <div className="w-[240px] rounded-2xl border border-[var(--border)] bg-white p-2 shadow-xl">
                        {['Tanzania', 'Kenya', 'South Africa', 'Botswana', 'Uganda', 'Rwanda'].map((c) => (
                          <Link
                            key={c}
                            href={`/parks/${c.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={() => setOpenMenu(null)}
                            className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-[var(--ink)] hover:bg-[var(--gold-soft)] hover:text-[var(--gold-ink)] transition-colors"
                          >
                            <span>{c}</span>
                            <span className="text-base">{countryFlags[c]}</span>
                          </Link>
                        ))}
                        <div className="border-t border-[var(--border-soft)] mt-1 pt-1">
                          <Link
                            href="/parks"
                            onClick={() => setOpenMenu(null)}
                            className="block rounded-xl px-3.5 py-2 text-[12px] font-extrabold text-[var(--gold)] hover:bg-[var(--surface-raised)]"
                          >
                            All Destination Parks →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tour Operators */}
                <Link
                  href="/operators"
                  className={`flex items-center gap-1.5 px-3 py-5 transition-colors border-b-2 ${
                    isActive('/operators') ? 'text-[var(--gold)] border-[var(--gold)]' : 'border-transparent hover:text-[var(--gold)]'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[var(--gold)]" /> Tour Operators
                </Link>

                {/* Blogs */}
                <Link
                  href="/blog"
                  className={`flex items-center gap-1.5 px-3 py-5 transition-colors border-b-2 ${
                    isActive('/blog') ? 'text-[var(--gold)] border-[var(--gold)]' : 'border-transparent hover:text-[var(--gold)]'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-[var(--gold)]" /> Blogs
                </Link>
              </nav>
            </div>

            {/* Right Actions: Favorites & Search */}
            <div className="hidden lg:flex items-center gap-4 text-[14px]">
              <Link href="/favorites" className="flex items-center gap-1.5 text-[var(--ink)] hover:text-[var(--gold)] font-bold group transition-colors" aria-label="Wishlist">
                <div className="relative">
                  <Heart className="h-5 w-5 group-hover:fill-[var(--gold-soft)] text-[var(--gold)]" strokeWidth={2} />
                  {favoriteCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-extrabold text-white shadow-xs">{favoriteCount}</span>
                  )}
                </div>
                <span>Wishlist</span>
              </Link>
              <NavbarSearch />
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center text-[var(--ink)] p-1.5 rounded-xl hover:bg-[var(--surface-raised)]"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-6 w-6 text-[var(--gold)]" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Drawer Navigation */}
          {mobileOpen && (
            <div className="absolute left-0 right-0 top-[102px] z-40 max-h-[calc(100vh-102px)] overflow-y-auto border-t border-[var(--border)] bg-white shadow-2xl lg:hidden p-4">
              <nav className="flex flex-col gap-2 text-[15px]">
                <Link href="/" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--gold-soft)]">
                  <Home className="w-4 h-4 text-[var(--gold)]" /> Home
                </Link>
                <Link href="/tours" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--gold-soft)]">
                  <Compass className="w-4 h-4 text-[var(--gold)]" /> Safaris &amp; Tours
                </Link>
                <Link href="/parks" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--gold-soft)]">
                  <MapPin className="w-4 h-4 text-[var(--gold)]" /> Destinations
                </Link>
                <Link href="/operators" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--gold-soft)]">
                  <Building2 className="w-4 h-4 text-[var(--gold)]" /> Tour Operators
                </Link>
                <Link href="/blog" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--gold-soft)]">
                  <BookOpen className="w-4 h-4 text-[var(--gold)]" /> Blogs
                </Link>
                <Link href="/favorites" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--gold-soft)]">
                  <Heart className="w-4 h-4 text-[var(--gold)]" /> Wishlist ({favoriteCount})
                </Link>
                <NavbarSearch mobile onNavigate={() => setMobileOpen(false)} />
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
