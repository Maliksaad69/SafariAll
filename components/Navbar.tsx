'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Heart, User, ChevronDown, Menu, X, Compass, Calendar } from 'lucide-react';
import NavbarSearch from '@/components/NavbarSearch';
import { safariOperators, safariTours } from '@/lib/site-data';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  // Close the mobile menu whenever the route changes
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

  // Dynamic country list from the actual tour data
  const countries = Array.from(new Set(safariTours.map((t) => t.primaryCountry)));
  const topOperators = safariOperators.slice(0, 5);

  const navMenus = [
    {
      href: '/tours',
      label: 'Safaris & Tours',
      items: [
        ...countries.map((country) => ({ label: `${country} Safaris`, href: `/tours?country=${encodeURIComponent(country)}` })),
        { label: 'Private Safaris', href: '/tours?tourType=PRIVATE' },
        { label: 'Budget Safaris', href: '/tours?comfort=BUDGET' },
        { label: 'Luxury Safaris', href: '/tours?comfort=LUXURY' },
        { label: 'All Safaris', href: '/tours' },
      ],
    },
    {
      href: '/parks',
      label: 'Countries & Parks',
      items: [
        ...countries.map((country) => ({ label: country, href: `/parks/${country.toLowerCase().replace(/\s+/g, '-')}` })),
        { label: 'All Countries', href: '/parks' },
      ],
    },
    {
      href: '/blogs',
      label: 'Blogs',
      items: [
        { label: 'All Safari Stories', href: '/blogs' },
        { label: 'Travel Guides', href: '/blogs?tag=Travel%20Guides' },
        { label: 'Parks & Wildlife', href: '/blogs?tag=Parks%20%26%20Wildlife' },
        { label: 'Trip Reports', href: '/blogs?tag=Trip%20Reports' },
      ],
    },
    {
      href: '/operators',
      label: 'Tour Operators',
      items: [
        ...topOperators.map((op) => ({ label: op.companyName, href: `/operators/${op.slug}` })),
        { label: 'All Operators', href: '/operators' },
      ],
    },
  ];

  const [favoriteCount, setFavoriteCount] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="sticky top-0 z-50 bg-[var(--dark)] text-[var(--dark-text)] font-sans shadow-[0_1px_0_rgba(255,255,255,0.10)]">
      <div className="mx-auto max-w-[1230px] px-4">
        <div className="flex h-[58px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="leading-none flex items-center gap-2">
              <img
                src="/images/safaribuilt-logo.png"
                alt="SafariBuilt — One Marketplace for African Safari Tours"
                className="h-[34px] md:h-[40px] w-auto"
              />
            </div>
          </Link>

          <div className="hidden lg:flex items-center flex-1 justify-center">
            <nav className="relative flex items-center gap-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--dark-text-soft)]">
              {navMenus.map(({ href, label, items }) => {
                const active = isActive(href);
                const isOpen = openMenu === href;

                return (
                  <div
                    key={href}
                    className="relative"
                    onMouseEnter={() => setOpenMenu(href)}
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    <Link
                      href={href}
                      className={`flex items-center gap-1.5 px-3 py-4 transition-colors border-b-2 ${active ? 'text-white border-[var(--dark-gold)]' : 'border-transparent hover:text-white'}`}
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                    >
                      {label}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </Link>

                    <div
                      className={`absolute left-0 top-full pt-2 transition-all duration-200 ${
                        isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
                      }`}
                    >
                      <div className="w-[230px] rounded-[10px] border border-[var(--border)] bg-white p-2 shadow-[0_12px_28px_rgba(36,22,13,0.18)]">
                        {items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenMenu(null)}
                            className="block rounded-[8px] px-3 py-2 text-[12px] font-medium text-[var(--ink-body)] transition-colors hover:bg-[var(--surface-sunk)] hover:text-[var(--ink)]"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="hidden lg:flex items-center gap-5 text-[14px]">
            <Link href="/favorites" className="flex items-center gap-1.5 hover:text-white group" aria-label="Favorites list">
              <div className="relative">
                <Heart className="h-5 w-5 group-hover:fill-white/30" strokeWidth={1.5} />
                {favoriteCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[var(--dark-gold)] px-0.5 text-[9px] font-bold text-[var(--dark)]">{favoriteCount}</span>
                )}
              </div>
              List
            </Link>
            <NavbarSearch />
            {sessionUser ? (
              <div className="relative ml-1" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 hover:text-white"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  aria-label="Account menu"
                >
                  <span className="max-w-[110px] truncate text-[13px] font-semibold">{sessionUser.name || sessionUser.email?.split('@')[0]}</span>
                  <User className="h-5 w-5" strokeWidth={1.5} />
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-52 rounded-md bg-white shadow-xl text-[#333] overflow-hidden border border-[#eee]">
                    <div className="border-b border-gray-100 px-3 py-2 text-[11px] text-[#8a8a8a] truncate">{sessionUser.email}</div>
                    {sessionUser.role === 'OPERATOR' && (
                      <Link href="/operator-portal" className="block px-3 py-2 text-[13px] font-semibold hover:bg-gray-50">Agency Dashboard</Link>
                    )}
                    {sessionUser.role === 'ADMIN' && (
                      <Link href="/admin" className="block px-3 py-2 text-[13px] font-semibold hover:bg-gray-50">Admin Panel</Link>
                    )}
                    {sessionUser.role === 'TRAVELER' && (
                      <>
                        <Link href="/favorites" className="block px-3 py-2 text-[13px] hover:bg-gray-50">Saved Tours</Link>
                        <Link href="/my-trips" className="block px-3 py-2 text-[13px] font-semibold hover:bg-gray-50">My Bookings</Link>
                        <Link href="/quote/request" className="block px-3 py-2 text-[13px] hover:bg-gray-50">Request a Quote</Link>
                      </>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-[13px] text-[#c0392b] hover:bg-[#fdf0ee] border-t border-gray-100">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link href="/login" className="rounded-lg border border-white/40 px-3 py-1.5 text-[13px] font-bold hover:bg-white/10 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="rounded-lg bg-[var(--dark-gold)] px-3 py-1.5 text-[13px] font-bold text-[var(--dark)] hover:brightness-110 transition">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Single hamburger for small + medium screens */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex items-center justify-center text-white p-1"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile / tablet drawer */}
        {mobileOpen && (
          <div className="absolute left-0 right-0 top-[58px] z-40 max-h-[calc(100vh-58px)] overflow-y-auto border-t border-[var(--dark-border)] bg-[var(--dark-raised)] shadow-xl lg:hidden">
            <nav className="flex flex-col gap-1 p-3 text-[15px]">
              {navMenus.map(({ href, label, items }) => (
                <div key={href} className="rounded-lg border border-[var(--dark-border)] bg-white/5">
                  <Link href={href} onClick={() => setMobileOpen(false)} className="flex w-full items-center justify-between px-2 py-2 text-white">
                    <span>{label}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Link>
                  <div className="space-y-1 border-t border-white/10 px-2 pb-2 pt-2">
                    {items.map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block px-2 py-1.5 text-sm text-white/85 hover:text-white">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <Link href="/favorites" onClick={() => setMobileOpen(false)} className="px-2 py-2 hover:bg-black/10 rounded text-white flex items-center gap-2">
                <Heart className="h-4 w-4" /> Favorites List
              </Link>
              <NavbarSearch mobile onNavigate={() => setMobileOpen(false)} />
              {sessionUser ? (
                <>
                  {sessionUser.role === 'OPERATOR' && (
                    <Link href="/operator-portal" onClick={() => setMobileOpen(false)} className="px-2 py-2 hover:bg-black/10 rounded text-white flex items-center gap-2">
                      <User className="h-4 w-4" /> Agency Dashboard
                    </Link>
                  )}
                  {sessionUser.role === 'ADMIN' && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="px-2 py-2 hover:bg-black/10 rounded text-white flex items-center gap-2">
                      <User className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  {sessionUser.role === 'TRAVELER' && (
                    <Link href="/my-trips" onClick={() => setMobileOpen(false)} className="px-2 py-2 hover:bg-black/10 rounded text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> My Bookings
                    </Link>
                  )}
                  {sessionUser.role === 'TRAVELER' && (
                    <Link href="/favorites" onClick={() => setMobileOpen(false)} className="px-2 py-2 hover:bg-black/10 rounded text-white flex items-center gap-2">
                      <User className="h-4 w-4" /> Saved Tours
                    </Link>
                  )}
                  <button onClick={handleLogout} className="px-2 py-2 hover:bg-black/10 rounded text-left text-[#FCA5A5] flex items-center gap-2">
                    <X className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-2 py-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 rounded border border-white/40 px-3 py-2 text-center text-[13px] font-bold text-white hover:bg-white/10">
                    Sign In
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 rounded bg-[var(--dark-gold)] px-3 py-2 text-center text-[13px] font-bold text-[var(--dark)] hover:brightness-110">
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
