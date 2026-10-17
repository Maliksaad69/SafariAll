'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Compass, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

const demoAccounts = {
  customer: [
    { label: 'Traveler Account', email: 'traveler@gmail.com', pass: 'TravelerPass123!' },
  ],
  agency: [
    { label: 'Tour Operator (Kili Expeditions)', email: 'info@kiliexpeditions.co.tz', pass: 'OperatorPass123!' },
  ],
};

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'customer' | 'agency'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in.');
      }

      setSuccess(`Welcome back, ${data.user.name}! Redirecting...`);
      setTimeout(() => {
        if (data.user.role === 'OPERATOR') {
          router.push('/operator-portal');
        } else if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="surface-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 w-full max-w-4xl">

          {/* Left brand panel */}
          <div className="lg:col-span-5 surface-dark rounded-none p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/15">
                <Compass className="h-6 w-6 text-[var(--dark-gold)]" />
              </div>
              <h2 className="text-2xl font-bold leading-tight text-[var(--dark-text)] font-display">
                Africa&apos;s Safari Marketplace
              </h2>
              <p className="text-sm leading-relaxed text-[var(--dark-text-soft)]">
                Book directly with licensed local agencies across Tanzania, Kenya, South Africa, Uganda, and Botswana.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--dark-gold)]">
                <KeyRound className="h-4 w-4" />
                Demo Quick-Fill
              </div>
              <div className="grid gap-2">
                {demoAccounts[tab].map((acct) => (
                  <button
                    key={acct.email}
                    type="button"
                    onClick={() => fillDemo(acct.email, acct.pass)}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-left text-xs text-[var(--dark-text)] transition hover:bg-white/20"
                  >
                    <span>{acct.label}</span>
                    <span className="font-bold text-[var(--dark-gold)]">Fill</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] leading-relaxed text-[var(--dark-text-soft)]">
                {tab === 'customer'
                  ? 'Customers browse tours, reserve trips, and track agency approvals.'
                  : 'Agencies review reservation requests, approve bookings, and manage tour packages.'}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-6 text-xs text-[var(--dark-text-soft)]">
              <ShieldCheck className="h-4 w-4 text-[var(--dark-gold)]" />
              Secure session · Encrypted passwords
            </div>
          </div>

          {/* Right form panel */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
            <div className="mx-auto w-full max-w-sm space-y-6">

              <div>
                <h1 className="text-3xl font-bold text-[var(--ink)] font-display">
                  Sign In
                </h1>
                <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                  Choose your account type, then sign in to continue.
                </p>
              </div>

              {/* Account type tabs */}
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-[var(--surface-sunk)] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setTab('customer');
                    setEmail('');
                    setPassword('');
                    setError('');
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition ${tab === 'customer' ? 'bg-white text-[var(--ink)] shadow-sm' : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'}`}
                >
                  Customer Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('agency');
                    setEmail('');
                    setPassword('');
                    setError('');
                  }}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition ${tab === 'agency' ? 'bg-white text-[var(--ink)] shadow-sm' : 'text-[var(--ink-secondary)] hover:text-[var(--ink)]'}`}
                >
                  Agency Login
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-[rgba(185,28,28,0.25)] bg-[var(--danger-soft)] p-3.5 text-sm font-medium text-[var(--danger)]">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-3 rounded-xl border border-[rgba(22,101,52,0.25)] bg-[var(--success-soft)] p-3.5 text-sm font-medium text-[var(--success)]">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="form-label">Email Address</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="form-control pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="form-label">Password</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      className="form-control pl-10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? 'Signing in...' : tab === 'agency' ? 'Sign In to Agency Portal' : 'Sign In'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="border-t border-[var(--border-soft)] pt-5 text-center">
                <p className="text-sm text-[var(--ink-secondary)]">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="link">Create a free account</Link>
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
