'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  User,
  LogOut,
  ShieldCheck,
  MapPin,
  Search,
  Menu,
  X,
  ChevronDown,
  Award,
  Globe,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setSessionUser(d.user))
      .catch(() => setSessionUser(null));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSessionUser(null);
    setUserMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/tours', label: 'Find Safaris', icon: Search },
    { href: '/parks', label: 'National Parks', icon: MapPin },
    { href: '/operators', label: 'Operators', icon: ShieldCheck },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-nav shadow-sm'
          : 'bg-[rgba(250,247,240,0.96)] border-b border-[rgba(228,219,202,0.6)]'
      }`}
      style={{ backdropFilter: 'blur(32px) saturate(2.2)', WebkitBackdropFilter: 'blur(32px) saturate(2.2)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #B8811A 0%, #D4A235 100%)', boxShadow: '0 4px 16px rgba(184,129,26,0.3)' }}
            >
              <Compass className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <span className="block text-xl font-bold leading-none tracking-tight" style={{ fontFamily: 'var(--font-display), Georgia, serif', color: '#1C1108' }}>
                Safari<span style={{ color: '#B8811A' }}>Asili</span>
              </span>
              <span className="block text-[10px] font-semibold tracking-widest uppercase mt-0.5" style={{ color: '#B8811A', fontFamily: 'var(--font-body), sans-serif' }}>
                African Marketplace
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    color: active ? '#B8811A' : '#3D2B0F',
                    background: active ? 'rgba(184,129,26,0.09)' : 'transparent',
                    fontFamily: 'var(--font-body), sans-serif',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = '#B8811A';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(184,129,26,0.06)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = '#3D2B0F';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                  {label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full"
                      style={{ background: 'linear-gradient(90deg, #B8811A, #D4A235)' }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Auth / User Area ── */}
          <div className="hidden md:flex items-center gap-3">
            {sessionUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200"
                  style={{
                    background: 'rgba(184,129,26,0.08)',
                    border: '1.5px solid rgba(184,129,26,0.2)',
                    fontFamily: 'var(--font-body), sans-serif',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #B8811A, #D4A235)' }}
                  >
                    {sessionUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="block text-sm font-semibold leading-none" style={{ color: '#1C1108' }}>
                      {sessionUser.name}
                    </span>
                    <span className="text-[10px] font-medium capitalize" style={{ color: '#B8811A' }}>
                      {sessionUser.role.toLowerCase()}
                    </span>
                  </div>
                  <ChevronDown
                    className="w-4 h-4 transition-transform duration-200"
                    style={{ color: '#9C7E58', transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 rounded-2xl py-2 z-50"
                    style={{
                      background: 'rgba(250,247,240,0.96)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      border: '1px solid rgba(228,219,202,0.8)',
                      boxShadow: '0 16px 48px rgba(28,17,8,0.12), 0 2px 8px rgba(28,17,8,0.06)',
                    }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(228,219,202,0.6)' }}>
                      <p className="text-xs mb-0.5" style={{ color: '#9C7E58', fontFamily: 'var(--font-body)' }}>Signed in as</p>
                      <p className="text-sm font-semibold truncate" style={{ color: '#1C1108', fontFamily: 'var(--font-body)' }}>{sessionUser.email}</p>
                    </div>
                    <div className="py-1">
                      {sessionUser.role === 'OPERATOR' && (
                        <Link href="/operator-portal" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[rgba(184,129,26,0.07)]"
                          style={{ color: '#3D2B0F', fontFamily: 'var(--font-body)' }}>
                          <Award className="w-4 h-4" style={{ color: '#B8811A' }} />
                          Operator Dashboard
                        </Link>
                      )}
                      {sessionUser.role === 'ADMIN' && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[rgba(184,129,26,0.07)]"
                          style={{ color: '#3D2B0F', fontFamily: 'var(--font-body)' }}>
                          <ShieldCheck className="w-4 h-4" style={{ color: '#1B4332' }} />
                          Admin Panel
                        </Link>
                      )}
                      {sessionUser.role === 'TRAVELER' && (
                        <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[rgba(184,129,26,0.07)]"
                          style={{ color: '#3D2B0F', fontFamily: 'var(--font-body)' }}>
                          <User className="w-4 h-4" style={{ color: '#B8811A' }} />
                          My Inquiries
                        </Link>
                      )}
                    </div>
                    <div className="border-t py-1" style={{ borderColor: 'rgba(228,219,202,0.6)' }}>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-red-50"
                        style={{ color: '#c0392b', fontFamily: 'var(--font-body)' }}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm px-4 py-2">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-sm px-5 py-2.5">
                  Register Free
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Toggle ── */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#1C1108' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* ── Mobile Drawer ── */}
        {mobileOpen && (
          <div
            className="md:hidden py-4 border-t space-y-1"
            style={{ borderColor: 'rgba(228,219,202,0.7)' }}
          >
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{
                  color: pathname.startsWith(href) ? '#B8811A' : '#3D2B0F',
                  background: pathname.startsWith(href) ? 'rgba(184,129,26,0.08)' : 'transparent',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <div className="pt-3 border-t space-y-2" style={{ borderColor: 'rgba(228,219,202,0.7)' }}>
              {sessionUser ? (
                <button onClick={handleLogout} className="w-full btn-secondary text-sm">
                  Sign Out ({sessionUser.name})
                </button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary w-full text-center text-sm">
                    Sign In
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center text-sm">
                    Register Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
