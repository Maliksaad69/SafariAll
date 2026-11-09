'use client';

import { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface AdminLoginFormProps {
  currentRole?: string | null;
  currentEmail?: string | null;
}

export default function AdminLoginForm({ currentRole, currentEmail }: AdminLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid administrator credentials.');
      }

      if (data.user?.role !== 'ADMIN') {
        throw new Error('This account does not have administrator privileges. Please use your owner credentials.');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/admin';
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="w-full max-w-md space-y-6">
          
          {/* Header Card */}
          <div className="surface-dark rounded-3xl p-8 text-white shadow-xl text-center relative overflow-hidden border border-white/10">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')`,
              }}
            />
            
            <div className="relative z-10 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white/10 text-[var(--brand-light)] mx-auto flex items-center justify-center backdrop-blur-md border border-white/15 shadow-inner">
                <ShieldCheck className="w-7 h-7 text-[var(--brand-light)]" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[var(--brand-light)] text-[11px] font-bold uppercase tracking-wider mb-2 border border-white/15">
                  Restricted Access
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  Owner Control Center
                </h1>
                <p className="text-xs text-white/80 mt-1 max-w-xs mx-auto font-light">
                  Authenticate with your platform credentials to access tour operator licensing, TALA verifications, and system moderation.
                </p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="surface-card rounded-3xl border border-black/5 p-8 shadow-sm space-y-6">
            
            {currentRole && currentRole !== 'ADMIN' && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-medium">
                You are currently logged in as a <strong>{currentRole}</strong> ({currentEmail}). Enter your administrator credentials below to switch to the Owner Control Center.
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Credentials authenticated! Entering Control Center...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@safariasili.com"
                    required
                    disabled={loading || success}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#193A38] uppercase tracking-wider">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    disabled={loading || success}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/15 bg-white text-xs font-medium text-[#193A38] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-3 rounded-2xl bg-[var(--brand)] hover:bg-[var(--brand-deep)] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Control Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            <div className="pt-2 text-center text-[11px] text-[var(--ink-muted)]">
              <span>Encrypted Session &bull; Protected by SafariRequest Security Protocol</span>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
