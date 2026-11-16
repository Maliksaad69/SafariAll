'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, User, ChevronDown, ChevronRight, Menu, X, Calendar, Bell, Compass } from 'lucide-react';
import NavbarSearch from '@/components/NavbarSearch';
import ChatLauncher from '@/components/ChatLauncher';
import { SAFARI_COUNTRIES, COUNTRY_FLAGS, getCountrySeoUrl } from '@/lib/countries';

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
      isWide: true,
      viewAllLabel: 'Browse All African Safari Tours & Packages →',
      items: countries.map((country) => {
        const flag = COUNTRY_FLAGS[country] || '';
        return {
          label: `${country} Safaris`,
          flag,
          href: `/african-safari-tours?country=${encodeURIComponent(country)}`,
        };
      }),
    },
    {
      href: '/top-safari-countries',
      label: 'Countries & Parks',
      isWide: true,
      viewAllLabel: 'Explore All 13 Safari Countries & National Parks →',
      items: countries.map((country) => {
        const flag = COUNTRY_FLAGS[country] || '';
        return {
          label: country,
          flag,
          href: getCountrySeoUrl(country),
        };
      }),
    },
    {
      href: '/safari-blog',
      label: 'Safari Blog',
      isWide: false,
      viewAllLabel: 'Browse All Safari Articles & Stories →',
      items: [
        { label: 'All Safari Stories', href: '/safari-blog', flag: '' },
        { label: 'Travel Guides', href: '/safari-blog?tag=Travel%20Guides', flag: '' },
        { label: 'Parks & Wildlife', href: '/safari-blog?tag=Parks%20%26%20Wildlife', flag: '' },
        { label: 'Trip Reports', href: '/safari-blog?tag=Trip%20Reports', flag: '' },
      ],
    },
    {
      href: '/safari-operators',
      label: 'Tour Operators',
      isWide: false,
      viewAllLabel: 'Browse All Verified Safari Operators →',
      items: [
        ...topOperators.map((op) => ({ label: op.companyName, href: `/operators/${op.slug}`, flag: '' })),
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
    <header className="glass-nav sticky top-0 z-50 font-sans text-[#1d302d] w-full border-b border-[#e1e8e3] bg-white/95 backdrop-blur-md overflow-x-clip shadow-xs">
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-6 xl:px-8">
        <div className="flex h-[54px] sm:h-[58px] lg:h-[62px] items-center justify-between gap-2 lg:gap-4 xl:gap-6 w-full min-w-0">
          <Link href="/" className="flex items-center flex-shrink-0 transition-opacity hover:opacity-90" aria-label="SafariHello homepage">
            <img
              src="/images/safaribuilt-logo.png?v=6"
              alt="SafariHello — Africa's Marketplace for Safari Tours"
              className="h-[30px] sm:h-[34px] lg:h-[38px] xl:h-[42px] w-auto object-contain shrink-0"
            />
          </Link>

          <div className="hidden lg:flex items-center justify-center flex-1 min-w-0 px-1 xl:px-3">
            <nav className="relative flex items-center justify-center gap-0.5 xl:gap-1.5 2xl:gap-3 text-[11px] xl:text-[12px] font-bold uppercase tracking-[0.03em] text-[#1d302d]">
              {navMenus.map(({ href, label, items, isWide, viewAllLabel }) => {
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
                      className={`flex items-center gap-1 xl:gap-1.5 rounded-full px-2 py-1 xl:px-3 xl:py-1.5 transition-colors whitespace-nowrap ${active ? 'bg-[#123b34]/10 text-[#123b34] font-extrabold shadow-xs' : 'text-[#1d302d] hover:bg-[#F7F6F0] hover:text-[#e78748]'}`}
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                    >
                      <span>{label}</span>
                      <ChevronDown className={`h-3 w-3 xl:h-3.5 xl:w-3.5 text-[#697771] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#e78748]' : ''}`} />
                    </Link>

                    <div
                      className={`absolute ${isWide ? '-left-8 sm:-left-12' : 'left-0'} top-full pt-2 transition-all duration-200 ${
                        isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
                      }`}
                    >
                      <div
                        className={`popover p-3 bg-white text-[#193A38] border border-[#DEDCCF] shadow-2xl rounded-2xl ${
                          isWide ? 'w-[470px] sm:w-[500px]' : 'w-[240px]'
                        }`}
                      >
                        {isWide ? (
                          <>
                            <div className="px-2 pb-2 mb-1.5 border-b border-[#DEDCCF]/70 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-[#516D6A]">
                              <span>Destinations (A–Z)</span>
                              <span className="text-[#8C9F91] font-semibold">{items.length} African Countries</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-1.5 gap-y-1">
                              {items.map((item) => (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setOpenMenu(null)}
                                  className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-[13px] font-semibold normal-case tracking-normal !text-[#193A38] transition-colors hover:bg-[#E4DBB4]/40 hover:!text-[#193A38] group"
                                >
                                  {item.flag && <span className="text-base shrink-0 leading-none">{item.flag}</span>}
                                  <span className="truncate group-hover:translate-x-0.5 transition-transform">{item.label}</span>
                                </Link>
                              ))}
                            </div>
                            {viewAllLabel && (
                              <div className="mt-2.5 pt-2 border-t border-[#DEDCCF]">
                                <Link
                                  href={href}
                                  onClick={() => setOpenMenu(null)}
                                  className="flex items-center justify-between rounded-xl bg-[#F7F6F1] hover:bg-[#E4DBB4]/40 px-3 py-2 text-xs font-bold !text-[#193A38] transition-colors"
                                >
                                  <span>{viewAllLabel}</span>
                                  <ChevronRight className="w-3.5 h-3.5 text-[#214446]" />
                                </Link>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
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
                            {viewAllLabel && (
                              <div className="mt-1 pt-1.5 border-t border-[#DEDCCF]">
                                <Link
                                  href={href}
                                  onClick={() => setOpenMenu(null)}
                                  className="block rounded-lg px-3 py-1.5 text-xs font-bold text-[#214446] hover:bg-[#E4DBB4]/40 transition-colors"
                                >
                                  {viewAllLabel}
                                </Link>
                              </div>
                            )}
                          </>
                        )}
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
                  className="relative flex items-center text-[#1d302d] transition-colors hover:text-[#123b34] p-1.5 rounded-full hover:bg-[#F7F6F0]"
                  aria-label="Travel notifications"
                  aria-expanded={notifOpen}
                >
                  <Bell className="h-5 w-5" strokeWidth={1.6} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#e78748] px-1 text-[9px] font-bold text-white shadow">{unreadCount}</span>
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
            <Link href="/favorites" className="flex items-center gap-1 text-[#1d302d] transition-colors hover:text-[#e78748] group px-1.5 py-1 shrink-0 rounded-full hover:bg-[#F7F6F0]" aria-label="Favorites list">
              <div className="relative">
                <Heart className="h-4 w-4 xl:h-5 xl:w-5 text-[#1d302d] group-hover:text-[#e78748] group-hover:fill-[#e78748]/20 transition-colors" strokeWidth={1.6} />
                {favoriteCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#123b34] px-1 text-[9px] font-bold text-white shadow">{favoriteCount}</span>
                )}
              </div>
              <span className="hidden xl:inline text-[#1d302d] group-hover:text-[#e78748]">List</span>
            </Link>
            <NavbarSearch />
            {sessionUser ? (
              <div className="relative ml-0.5" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 text-[#1d302d] transition-colors hover:text-[#123b34] px-2 py-1 rounded-full hover:bg-[#F7F6F0]"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  aria-label="Account menu"
                >
                  <span className="max-w-[80px] xl:max-w-[120px] truncate text-xs xl:text-[13px] font-bold text-[#1d302d]">{sessionUser.name || sessionUser.email?.split('@')[0]}</span>
                  <User className="h-4 w-4 xl:h-5 xl:w-5 text-[#1d302d]" strokeWidth={1.6} />
                  <ChevronDown className="h-3 w-3 xl:h-3.5 xl:w-3.5 text-[#697771]" />
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
                  href="/register?role=OPERATOR"
                  className="hidden xl:inline-flex items-center justify-center rounded-xl border border-[#e1e8e3] bg-[#F7F6F0] hover:bg-[#eae8de] px-2.5 py-1 text-xs font-bold text-[#123b34] transition-colors whitespace-nowrap"
                >
                  List Your Tours
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-[#e1e8e3] px-2.5 py-1 text-xs font-bold text-[#1d302d] transition-colors hover:bg-[#F7F6F0] hover:border-[#697771]/30 whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-[#123b34] hover:bg-[#0b2926] px-2.5 py-1 text-xs font-bold text-white shadow-xs transition-colors whitespace-nowrap"
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
                  className="hidden sm:inline-flex items-center rounded-lg border border-[#e1e8e3] px-2.5 py-1 text-xs font-bold text-[#1d302d] hover:bg-[#F7F6F0] transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-lg bg-[#123b34] hover:bg-[#0b2926] px-2.5 sm:px-3 py-1 text-xs font-bold text-white shadow-xs transition-colors whitespace-nowrap"
                >
                  Register
                </Link>
              </div>
            )}
            {sessionUser && isDesktop === false && <ChatLauncher className="mr-0.5 text-[#1d302d] hover:text-[#123b34]" />}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-full text-[#1d302d] transition-colors hover:bg-black/5 active:scale-95"
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
          className="fixed inset-0 top-[54px] sm:top-[58px] lg:top-[62px] z-40 bg-black/45 backdrop-blur-sm transition-opacity duration-200 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Panel */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-label="Mobile Navigation Menu"
          className="fixed left-0 right-0 top-[54px] sm:top-[58px] lg:top-[62px] z-50 max-h-[calc(100vh-54px)] sm:max-h-[calc(100vh-58px)] lg:max-h-[calc(100vh-62px)] overflow-y-auto overscroll-contain border-t border-[#DEDCCF] bg-[#F7F6F1] shadow-2xl transition-all duration-300 lg:hidden"
        >
          <div className="flex flex-col gap-3 p-4 text-[15px]">
            {/* Mobile Header Logo */}
            <div className="flex items-center justify-between pb-1 border-b border-[#DEDCCF]/70">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center">
                <img
                  src="/images/safaribuilt-logo.png?v=6"
                  alt="SafariHello"
                  className="h-[36px] w-auto object-contain"
                />
              </Link>
            </div>

            {/* Quick search input */}
            <div className="rounded-2xl border border-[#DEDCCF] bg-white p-1 shadow-xs">
              <NavbarSearch mobile onNavigate={() => setMobileOpen(false)} />
            </div>

            {/* Accordion Navigation Menus */}
            <nav className="flex flex-col gap-2">
              {navMenus.map(({ href, label, items, isWide, viewAllLabel }) => {
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
                      <div className="border-t border-[#DEDCCF] bg-[#E4DBB4]/20 px-2.5 py-2.5">
                        <Link
                          href={href}
                          onClick={() => setMobileOpen(false)}
                          className="flex min-h-[40px] items-center justify-between rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#214446] transition-colors hover:bg-[#E4DBB4]/40 bg-white/70 mb-2 border border-[#DEDCCF]"
                        >
                          <span>{viewAllLabel || `Explore All ${label}`}</span>
                          <span className="text-xs">→</span>
                        </Link>
                        <div className={isWide ? 'grid grid-cols-2 gap-1.5' : 'grid grid-cols-1 gap-1'}>
                          {items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex min-h-[38px] items-center gap-2 rounded-xl px-2.5 py-1.5 text-[12px] font-semibold text-[#344C49] transition-colors hover:bg-[#E4DBB4]/40 hover:text-[#193A38] bg-white/80 border border-[#DEDCCF]/60"
                            >
                              {item.flag && <span className="text-sm shrink-0 leading-none">{item.flag}</span>}
                              <span className="truncate">{item.label}</span>
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
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="btn min-h-[42px] w-full justify-center text-[13px] border border-[#214446]/25 text-[#214446] bg-white hover:bg-[#E4DBB4]/30 font-bold"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="btn btn-primary min-h-[42px] w-full justify-center text-[13px] bg-[#214446] hover:bg-[#193A38] text-white font-bold"
                    >
                      Register
                    </Link>
                  </div>
                  <Link
                    href="/register?role=OPERATOR"
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-[40px] w-full items-center justify-center rounded-xl border border-[#DEDCCF] bg-white text-center text-[12.5px] font-bold text-[#193A38] hover:bg-[#E4DBB4]/20 transition-colors"
                  >
                    List Your Tours (For Tour Operators)
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
