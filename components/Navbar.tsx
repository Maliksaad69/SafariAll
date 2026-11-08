'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, User, ChevronDown, Menu, X, Calendar, Bell, Compass } from 'lucide-react';
import NavbarSearch from '@/components/NavbarSearch';
import ChatLauncher from '@/components/ChatLauncher';
import { SAFARI_COUNTRIES, COUNTRY_FLAGS } from '@/lib/countries';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(null);
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
    setMobileExpandedMenu(null);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSessionUser(null);
    setUserMenuOpen(false);
    window.location.href = '/';
  };

  // Country list and top operators come from Postgres via /api/site/nav
  const [countries, setCountries] = useState<string[]>([...SAFARI_COUNTRIES]);
  const [topOperators, setTopOperators] = useState<{ companyName: string; slug: string }[]>([]);
  useEffect(() => {
    fetch('/api/site/nav')
      .then((r) => r.json())
      .then((d) => {
        if (d.countries && d.countries.length > 0) {
          const sorted = Array.from(new Set([...SAFARI_COUNTRIES, ...d.countries])).sort((a: string, b: string) => a.localeCompare(b));
          setCountries(sorted);
        }
        if (d.operators && d.operators.length > 0) setTopOperators(d.operators);
      })
      .catch(() => {});
  }, []);

  const navMenus = [
    {
      href: '/african-safari-tours',
      label: 'Safaris & Tours',
      items: [
        ...countries.map((country) => {
          const flag = COUNTRY_FLAGS[country] ? `${COUNTRY_FLAGS[country]} ` : '';
          return { label: `${flag}${country} Safaris`, href: `/african-safari-tours?country=${encodeURIComponent(country)}` };
        }),
        { label: 'All Safaris', href: '/african-safari-tours' },
      ],
    },
    {
      href: '/top-safari-countries',
      label: 'Countries & Parks',
      items: [
        ...countries.map((country) => {
          const flag = COUNTRY_FLAGS[country] ? `${COUNTRY_FLAGS[country]} ` : '';
          return { label: `${flag}${country}`, href: `/parks/${country.toLowerCase().replace(/\s+/g, '-')}` };
        }),
        { label: 'All Countries', href: '/top-safari-countries' },
      ],
    },
    {
      href: '/safari-blog',
      label: 'Safari Blog',
      items: [
        { label: 'All Safari Stories', href: '/safari-blog' },
        { label: 'Travel Guides', href: '/safari-blog?tag=Travel%20Guides' },
        { label: 'Parks & Wildlife', href: '/safari-blog?tag=Parks%20%26%20Wildlife' },
        { label: 'Trip Reports', href: '/safari-blog?tag=Trip%20Reports' },
      ],
    },
    {
      href: '/safari-operators',
      label: 'Tour Operators',
      items: [
        ...topOperators.map((op) => ({ label: op.companyName, href: `/operators/${op.slug}` })),
        { label: 'All Safari Operators', href: '/safari-operators' },
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

  // Exactly one chat button is mounted: in the desktop action bar (right of the bell) or the mobile header.
  const isDesktop = useSyncExternalStore<boolean | null>(
    (onChange) => {
      const mq = window.matchMedia('(min-width: 1024px)');
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia('(min-width: 1024px)').matches,
    () => null,
  );

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const [notifications, setNotifications] = useState<Array<{ id: string; type?: string; title: string; body: string; link: string | null; isRead: boolean; createdAt: string }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionUser) return;
    fetch('/api/notifications?limit=15')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setNotifications(Array.isArray(d.notifications) ? d.notifications : []);
        setUnreadCount(typeof d.unread === 'number' ? d.unread : 0);
      })
      .catch(() => {});
  }, [sessionUser, pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleNotifications = async () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications((ns) => ns.map((n) => ({ ...n, isRead: true })));
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      }).catch(() => {});
    }
  };

  return (
    <header className="glass-nav sticky top-0 z-50 font-sans text-white w-full border-b border-white/10 overflow-x-clip">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-6 xl:px-8">
        <div className="flex h-[66px] sm:h-[72px] items-center justify-between gap-2 lg:gap-4 xl:gap-6 w-full min-w-0">
          <Link href="/" className="flex items-center flex-shrink-0 transition-opacity hover:opacity-90">
            <img
              src="/images/safaribuilt-logo.png?v=3"
              alt="SafariRequest — One Marketplace for African Safari Tours"
              className="h-[38px] sm:h-[44px] lg:h-[46px] xl:h-[50px] w-auto object-contain shrink-0"
            />
          </Link>

          <div className="hidden lg:flex items-center justify-center flex-1 min-w-0 px-1 xl:px-4">
            <nav className="relative flex items-center justify-center gap-1 xl:gap-2.5 2xl:gap-4 text-[12px] xl:text-[13px] font-bold uppercase tracking-[0.04em] text-white/90">
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
                      className={`flex items-center gap-1 xl:gap-1.5 rounded-full px-2.5 py-1.5 xl:px-3.5 xl:py-2 transition-colors whitespace-nowrap ${active ? 'bg-white/20 text-white shadow-xs' : 'hover:bg-white/10 hover:text-white'}`}
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                    >
                      <span>{label}</span>
                      <ChevronDown className={`h-3 w-3 xl:h-3.5 xl:w-3.5 text-white/80 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </Link>

                    <div
                      className={`absolute left-0 top-full pt-3 transition-all duration-200 ${
                        isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
                      }`}
                    >
                      <div className="popover w-[240px] p-2 bg-white text-[#193A38] border border-[#DEDCCF] shadow-xl rounded-xl">
                        {items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenMenu(null)}
                            className="block rounded-lg px-3 py-2 text-[13px] font-semibold normal-case tracking-normal !text-[#193A38] transition-colors hover:bg-[#E4DBB4]/40 hover:!text-[#193A38]"
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

          <div className="hidden lg:flex items-center gap-2 xl:gap-3 2xl:gap-4 text-xs xl:text-[13px] font-semibold shrink-0">
            {sessionUser && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={toggleNotifications}
                  className="relative flex items-center text-white/90 transition-colors hover:text-white p-1"
                  aria-label="Travel notifications"
                  aria-expanded={notifOpen}
                >
                  <Bell className="h-5 w-5" strokeWidth={1.6} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#8C9F91] px-1 text-[9px] font-bold text-white shadow">{unreadCount}</span>
                  )}
                </button>
                {notifOpen && (
                  <div className="popover absolute right-0 mt-3 w-[330px] overflow-hidden bg-white text-[#193A38] border border-[#DEDCCF] shadow-xl">
                    <div className="border-b border-[#DEDCCF] px-3 py-2 text-[11px] font-bold uppercase tracking-wider !text-[#516D6A]">
                      Travel notifications
                    </div>
                    <div className="max-h-[380px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-3 py-6 text-center text-[13px] font-normal !text-[#516D6A]">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((n) => {
                          const inner = (
                            <>
                              <div className="text-[13px] font-bold !text-[#193A38]">{n.title}</div>
                              <div className="mt-0.5 text-[12px] font-normal leading-snug !text-[#344C49]">{n.body}</div>
                              <div className="mt-1 text-[10px] font-medium uppercase tracking-wide !text-[#516D6A]">
                                {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                {n.type === 'CHAT_MESSAGE' ? ' · open it with the chat button' : ''}
                              </div>
                            </>
                          );
                          const cls = `block border-b border-[#DEDCCF] px-3 py-2.5 last:border-b-0 ${n.isRead ? '' : 'bg-[#E4DBB4]/30'}`;
                          return n.type === 'CHAT_MESSAGE' || !n.link ? (
                            <div key={n.id} className={cls}>{inner}</div>
                          ) : (
                            <Link key={n.id} href={n.link} onClick={() => setNotifOpen(false)} className={`${cls} transition-colors hover:bg-[#E4DBB4]/40`}>
                              {inner}
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {sessionUser && isDesktop === true && <ChatLauncher />}
            <Link href="/favorites" className="flex items-center gap-1 text-white/90 transition-colors hover:text-white group px-1 py-1 shrink-0" aria-label="Favorites list">
              <div className="relative">
                <Heart className="h-4 w-4 xl:h-5 xl:w-5 text-white/90 group-hover:fill-white/30" strokeWidth={1.6} />
                {favoriteCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#193A38] px-1 text-[9px] font-bold text-white shadow border border-white/20">{favoriteCount}</span>
                )}
              </div>
              <span className="hidden xl:inline">List</span>
            </Link>
            <NavbarSearch />
            {sessionUser ? (
              <div className="relative ml-0.5" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 text-white/90 transition-colors hover:text-white"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  aria-label="Account menu"
                >
                  <span className="max-w-[80px] xl:max-w-[120px] truncate text-xs xl:text-[13px] font-bold text-white">{sessionUser.name || sessionUser.email?.split('@')[0]}</span>
                  <User className="h-4 w-4 xl:h-5 xl:w-5" strokeWidth={1.6} />
                  <ChevronDown className="h-3 w-3 xl:h-3.5 xl:w-3.5 text-white/80" />
                </button>
                {userMenuOpen && (
                  <div className="popover absolute right-0 mt-3 w-56 overflow-hidden bg-white text-[#193A38] border border-[#DEDCCF] shadow-xl">
                    <div className="truncate border-b border-[#DEDCCF] px-3 py-2 text-[11px] font-medium !text-[#516D6A]">{sessionUser.email}</div>
                    {sessionUser.role === 'OPERATOR' && (
                      <Link href="/operator-portal" className="block px-3 py-2 text-[13px] font-semibold !text-[#193A38] transition-colors hover:bg-[#E4DBB4]/40 hover:!text-[#193A38]">Agency Dashboard</Link>
                    )}
                    {sessionUser.role === 'ADMIN' && (
                      <Link href="/admin" className="block px-3 py-2 text-[13px] font-semibold !text-[#193A38] transition-colors hover:bg-[#E4DBB4]/40 hover:!text-[#193A38]">Admin Panel</Link>
                    )}
                    {sessionUser.role === 'TRAVELER' && (
                      <>
                        <Link href="/favorites" className="block px-3 py-2 text-[13px] font-semibold !text-[#193A38] transition-colors hover:bg-[#E4DBB4]/40 hover:!text-[#193A38]">Saved Tours</Link>
                        <Link href="/my-trips" className="block px-3 py-2 text-[13px] font-semibold !text-[#193A38] transition-colors hover:bg-[#E4DBB4]/40 hover:!text-[#193A38]">My Bookings</Link>
                        <Link href="/custom-safari-quote" className="block px-3 py-2 text-[13px] font-semibold !text-[#193A38] transition-colors hover:bg-[#E4DBB4]/40 hover:!text-[#193A38]">Request a Custom Quote</Link>
                      </>
                    )}
                    <button onClick={handleLogout} className="block w-full border-t border-[#DEDCCF] px-3 py-2 text-left text-[13px] font-semibold text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)]">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-white/30 px-2.5 xl:px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/10 hover:border-white/50 whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-[#E4DBB4] hover:bg-[#D8CDA1] px-3 xl:px-3.5 py-1.5 text-xs font-bold text-[#193A38] shadow-xs transition-colors whitespace-nowrap"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Chat launcher + mobile register + accessible hamburger button for mobile/tablet */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden shrink-0">
            {!sessionUser && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center rounded-lg border border-white/30 px-2.5 py-1 text-xs font-bold text-white hover:bg-white/10 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-lg bg-[#E4DBB4] hover:bg-[#D8CDA1] px-2.5 sm:px-3 py-1 text-xs font-bold text-[#193A38] shadow-xs transition-colors whitespace-nowrap"
                >
                  Register
                </Link>
              </div>
            )}
            {sessionUser && isDesktop === false && <ChatLauncher className="mr-0.5" />}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 active:scale-95"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-[66px] sm:top-[72px] z-40 bg-black/45 backdrop-blur-sm transition-opacity duration-200 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Panel */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-label="Mobile Navigation Menu"
          className="fixed left-0 right-0 top-[66px] sm:top-[72px] z-50 max-h-[calc(100vh-66px)] sm:max-h-[calc(100vh-72px)] overflow-y-auto overscroll-contain border-t border-[#DEDCCF] bg-[#F7F6F1] shadow-2xl transition-all duration-300 lg:hidden"
        >
          <div className="flex flex-col gap-3 p-4 text-[15px]">
            {/* Quick search input */}
            <div className="rounded-2xl border border-[#DEDCCF] bg-white p-1 shadow-xs">
              <NavbarSearch mobile onNavigate={() => setMobileOpen(false)} />
            </div>

            {/* Accordion Navigation Menus */}
            <nav className="flex flex-col gap-2">
              {navMenus.map(({ href, label, items }) => {
                const isExpanded = mobileExpandedMenu === label;
                const active = isActive(href);

                return (
                  <div
                    key={href}
                    className={`overflow-hidden rounded-2xl border transition-all ${
                      isExpanded
                        ? 'border-[#214446]/40 bg-white shadow-sm ring-1 ring-[#214446]/20'
                        : 'border-[#DEDCCF] bg-white hover:bg-[#E4DBB4]/20'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setMobileExpandedMenu(isExpanded ? null : label)}
                      className="flex min-h-[48px] w-full items-center justify-between px-4 py-3 text-left font-bold text-[#193A38] transition-colors"
                      aria-expanded={isExpanded}
                    >
                      <span className={`text-[14px] uppercase tracking-[0.05em] ${active ? 'text-[#214446] font-extrabold' : ''}`}>
                        {label}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#344C49] transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-[#214446]' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="border-t border-[#DEDCCF] bg-[#E4DBB4]/20 px-2 py-2">
                        <Link
                          href={href}
                          onClick={() => setMobileOpen(false)}
                          className="flex min-h-[42px] items-center justify-between rounded-xl px-3 py-2 text-[13px] font-bold text-[#214446] transition-colors hover:bg-[#E4DBB4]/40"
                        >
                          <span>Explore All {label}</span>
                          <span className="text-xs">→</span>
                        </Link>
                        <div className="grid grid-cols-1 gap-1 pt-1">
                          {items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex min-h-[42px] items-center rounded-xl px-3 py-2 text-[13px] font-medium text-[#344C49] transition-colors hover:bg-[#E4DBB4]/40 hover:text-[#193A38]"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Quick action bar */}
            <div className="mt-2 space-y-2 border-t border-[#DEDCCF] pt-3">
              <Link
                href="/favorites"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[46px] items-center justify-between rounded-2xl border border-[#DEDCCF] bg-white px-4 py-2.5 font-semibold text-[#193A38] shadow-xs transition-colors hover:bg-[#E4DBB4]/30 active:scale-[0.99]"
              >
                <span className="flex items-center gap-2.5 text-[14px]">
                  <Heart className="h-4 w-4 text-[#214446]" />
                  Saved Tours
                </span>
                {favoriteCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#214446] px-1.5 text-[11px] font-bold text-white">
                    {favoriteCount}
                  </span>
                )}
              </Link>

              {sessionUser ? (
                <div className="space-y-1.5">
                  <div className="rounded-2xl border border-[#DEDCCF] bg-white p-3">
                    <div className="flex items-center gap-2.5 text-xs text-[#344C49]/70">
                      <User className="h-4 w-4 text-[#214446]" />
                      <span className="truncate font-semibold text-[#193A38]">{sessionUser.name || sessionUser.email}</span>
                    </div>
                  </div>

                  {sessionUser.role === 'OPERATOR' && (
                    <Link
                      href="/operator-portal"
                      onClick={() => setMobileOpen(false)}
                      className="flex min-h-[46px] items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 font-semibold text-[#193A38] hover:bg-[#E4DBB4]/30"
                    >
                      <User className="h-4 w-4 text-[#214446]" /> Agency Dashboard
                    </Link>
                  )}
                  {sessionUser.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex min-h-[46px] items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 font-semibold text-[#193A38] hover:bg-[#E4DBB4]/30"
                    >
                      <User className="h-4 w-4 text-[#214446]" /> Admin Panel
                    </Link>
                  )}
                  {sessionUser.role === 'TRAVELER' && (
                    <>
                      <Link
                        href="/my-trips"
                        onClick={() => setMobileOpen(false)}
                        className="flex min-h-[46px] items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 font-semibold text-[#193A38] hover:bg-[#E4DBB4]/30"
                      >
                        <Calendar className="h-4 w-4 text-[#214446]" /> My Bookings
                      </Link>
                      <Link
                        href="/custom-safari-quote"
                        onClick={() => setMobileOpen(false)}
                        className="flex min-h-[46px] items-center gap-2.5 rounded-xl bg-white px-4 py-2.5 font-semibold text-[#193A38] hover:bg-[#E4DBB4]/30"
                      >
                        <Compass className="h-4 w-4 text-[#214446]" /> Request a Custom Quote
                      </Link>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex min-h-[46px] w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-left font-semibold text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)] active:scale-[0.99]"
                  >
                    <X className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn min-h-[48px] w-full justify-center text-[14px] border border-[#214446]/25 text-[#214446] bg-white hover:bg-[#E4DBB4]/30"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="btn btn-primary min-h-[48px] w-full justify-center text-[14px] bg-[#214446] hover:bg-[#193A38] text-white font-bold"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
