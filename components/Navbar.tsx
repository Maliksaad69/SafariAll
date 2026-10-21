'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, User, ChevronDown, Menu, X, Calendar, Bell } from 'lucide-react';
import NavbarSearch from '@/components/NavbarSearch';
import ChatLauncher from '@/components/ChatLauncher';

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

  // Country list and top operators come from Postgres via /api/site/nav
  const [countries, setCountries] = useState<string[]>([]);
  const [topOperators, setTopOperators] = useState<{ companyName: string; slug: string }[]>([]);
  useEffect(() => {
    fetch('/api/site/nav')
      .then((r) => r.json())
      .then((d) => {
        setCountries(d.countries ?? []);
        setTopOperators(d.operators ?? []);
      })
      .catch(() => {});
  }, []);

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
    <header className="glass-nav sticky top-0 z-50 font-sans text-[var(--ink)]">
      <div className="mx-auto max-w-[1230px] px-4">
        <div className="flex h-[64px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center flex-shrink-0">
            <img
              src="/images/safaribuilt-logo.png"
              alt="SafariRequest — One Marketplace for African Safari Tours"
              className="h-[34px] md:h-[42px] w-auto"
              style={{ mixBlendMode: 'multiply' }}
            />
          </Link>

          <div className="hidden lg:flex items-center flex-1 justify-center">
            <nav className="relative flex items-center gap-1 text-[13px] font-bold uppercase tracking-[0.06em] text-[var(--ink-secondary)]">
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
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 transition-colors ${active ? 'bg-white/70 text-[var(--ink)] shadow-sm' : 'hover:bg-white/55 hover:text-[var(--ink)]'}`}
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                    >
                      {label}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </Link>

                    <div
                      className={`absolute left-0 top-full pt-3 transition-all duration-200 ${
                        isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
                      }`}
                    >
                      <div className="popover w-[240px] p-2">
                        {items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenMenu(null)}
                            className="block rounded-xl px-3 py-2 text-[13px] font-medium normal-case tracking-normal text-[var(--ink-body)] transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--ink)]"
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

          <div className="hidden lg:flex items-center gap-4 text-[13px] font-semibold">
            {sessionUser && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={toggleNotifications}
                  className="relative flex items-center text-[var(--ink-secondary)] transition-colors hover:text-[var(--ink)]"
                  aria-label="Travel notifications"
                  aria-expanded={notifOpen}
                >
                  <Bell className="h-5 w-5" strokeWidth={1.6} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[9px] font-bold text-[var(--brand-on)] shadow">{unreadCount}</span>
                  )}
                </button>
                {notifOpen && (
                  <div className="popover absolute right-0 mt-3 w-[330px] overflow-hidden">
                    <div className="border-b border-[var(--border-soft)] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                      Travel notifications
                    </div>
                    <div className="max-h-[380px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-3 py-6 text-center text-[13px] font-normal text-[var(--ink-muted)]">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((n) => {
                          const inner = (
                            <>
                              <div className="text-[13px] font-bold text-[var(--ink)]">{n.title}</div>
                              <div className="mt-0.5 text-[12px] font-normal leading-snug text-[var(--ink-secondary)]">{n.body}</div>
                              <div className="mt-1 text-[10px] font-normal uppercase tracking-wide text-[var(--ink-muted)]">
                                {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                {n.type === 'CHAT_MESSAGE' ? ' · open it with the chat button' : ''}
                              </div>
                            </>
                          );
                          const cls = `block border-b border-[var(--border-soft)] px-3 py-2.5 last:border-b-0 ${n.isRead ? '' : 'bg-[var(--brand-soft)]'}`;
                          // Chat messages are only announced here; the chat button next to the bell opens them.
                          return n.type === 'CHAT_MESSAGE' || !n.link ? (
                            <div key={n.id} className={cls}>{inner}</div>
                          ) : (
                            <Link key={n.id} href={n.link} onClick={() => setNotifOpen(false)} className={`${cls} transition-colors hover:bg-[var(--brand-soft)]`}>
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
            {sessionUser && <ChatLauncher />}
            <Link href="/favorites" className="flex items-center gap-1.5 text-[var(--ink-secondary)] transition-colors hover:text-[var(--ink)] group" aria-label="Favorites list">
              <div className="relative">
                <Heart className="h-5 w-5 group-hover:fill-[var(--brand)]/25" strokeWidth={1.6} />
                {favoriteCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[9px] font-bold text-[var(--brand-on)] shadow">{favoriteCount}</span>
                )}
              </div>
              List
            </Link>
            <NavbarSearch />
            {sessionUser ? (
              <div className="relative ml-1" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 text-[var(--ink-secondary)] transition-colors hover:text-[var(--ink)]"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  aria-label="Account menu"
                >
                  <span className="max-w-[110px] truncate text-[13px] font-bold text-[var(--ink)]">{sessionUser.name || sessionUser.email?.split('@')[0]}</span>
                  <User className="h-5 w-5" strokeWidth={1.6} />
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {userMenuOpen && (
                  <div className="popover absolute right-0 mt-3 w-56 overflow-hidden text-[var(--ink-body)]">
                    <div className="truncate border-b border-[var(--border-soft)] px-3 py-2 text-[11px] text-[var(--ink-muted)]">{sessionUser.email}</div>
                    {sessionUser.role === 'OPERATOR' && (
                      <Link href="/operator-portal" className="block px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-[var(--brand-soft)]">Agency Dashboard</Link>
                    )}
                    {sessionUser.role === 'ADMIN' && (
                      <Link href="/admin" className="block px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-[var(--brand-soft)]">Admin Panel</Link>
                    )}
                    {sessionUser.role === 'TRAVELER' && (
                      <>
                        <Link href="/favorites" className="block px-3 py-2 text-[13px] transition-colors hover:bg-[var(--brand-soft)]">Saved Tours</Link>
                        <Link href="/my-trips" className="block px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-[var(--brand-soft)]">My Bookings</Link>
                        <Link href="/quote/request" className="block px-3 py-2 text-[13px] transition-colors hover:bg-[var(--brand-soft)]">Request a Quote</Link>
                      </>
                    )}
                    <button onClick={handleLogout} className="block w-full border-t border-[var(--border-soft)] px-3 py-2 text-left text-[13px] font-semibold text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)]">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-1 flex items-center gap-2">
                <Link href="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
              </div>
            )}
          </div>

          {/* Chat button + single hamburger for small and medium screens */}
          {sessionUser && <ChatLauncher className="ml-auto lg:hidden" />}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center rounded-full p-1.5 text-[var(--ink)] transition-colors hover:bg-[var(--brand-soft)] lg:hidden"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile / tablet drawer */}
        {mobileOpen && (
          <div className="absolute left-0 right-0 top-[64px] z-40 max-h-[calc(100vh-64px)] overflow-y-auto border-t border-[var(--glass-border)] bg-white shadow-xl lg:hidden">
            <nav className="flex flex-col gap-1.5 p-3 text-[15px]">
              {navMenus.map(({ href, label, items }) => (
                <div key={href} className="rounded-2xl border border-[var(--glass-border)] bg-white/60">
                  <Link href={href} onClick={() => setMobileOpen(false)} className="flex w-full items-center justify-between px-3 py-2.5 font-semibold text-[var(--ink)]">
                    <span>{label}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Link>
                  <div className="space-y-0.5 border-t border-[var(--border-soft)] px-2 pb-2 pt-2">
                    {items.map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-2 py-1.5 text-sm text-[var(--ink-secondary)] hover:bg-[var(--brand-soft)] hover:text-[var(--ink)]">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <Link href="/favorites" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-2 py-2 font-semibold text-[var(--ink)] hover:bg-[var(--brand-soft)]">
                <Heart className="h-4 w-4" /> Favorites List
              </Link>
              <NavbarSearch mobile onNavigate={() => setMobileOpen(false)} />
              {sessionUser ? (
                <>
                  {sessionUser.role === 'OPERATOR' && (
                    <Link href="/operator-portal" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-2 py-2 font-semibold text-[var(--ink)] hover:bg-[var(--brand-soft)]">
                      <User className="h-4 w-4" /> Agency Dashboard
                    </Link>
                  )}
                  {sessionUser.role === 'ADMIN' && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-2 py-2 font-semibold text-[var(--ink)] hover:bg-[var(--brand-soft)]">
                      <User className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  {sessionUser.role === 'TRAVELER' && (
                    <Link href="/my-trips" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-2 py-2 font-semibold text-[var(--ink)] hover:bg-[var(--brand-soft)]">
                      <Calendar className="h-4 w-4" /> My Bookings
                    </Link>
                  )}
                  {sessionUser.role === 'TRAVELER' && (
                    <Link href="/favorites" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-xl px-2 py-2 font-semibold text-[var(--ink)] hover:bg-[var(--brand-soft)]">
                      <User className="h-4 w-4" /> Saved Tours
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl px-2 py-2 text-left font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)]">
                    <X className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-2 py-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="btn btn-secondary flex-1">Sign In</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary flex-1">Register</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
