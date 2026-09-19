'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Compass, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, User, KeyRound, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
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
          router.push('/dashboard');
        }
        router.refresh();
      }, 1000);
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
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-white relative">
      
      {/* Background Safari Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-40 pointer-events-none"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1800&q=80')` }}
      />
      <div className="fixed inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/70 to-[#0b0c10]/40 pointer-events-none" />

      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-5xl glass-card rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-white/20">
          
          {/* Left Visual Banner */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0b0c10]/90 via-[#1c402e]/80 to-[#c85a17]/90 p-8 text-white flex flex-col justify-between relative overflow-hidden backdrop-blur-xl border-r border-white/10">
            
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                <Compass className="w-7 h-7 text-[#f59e0b]" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white leading-tight">
                Authentic African Safaris
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Connect directly with licensed local tour operators across Tanzania, Kenya, South Africa, Uganda, and Botswana.
              </p>
            </div>

            {/* Quick Demo Credentials Box */}
            <div className="relative z-10 mt-8 glass-card-light p-5 rounded-2xl border border-white/15 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#f59e0b] uppercase tracking-wider text-glow-amber">
                <KeyRound className="w-4 h-4" />
                Instant Demo Quick-Fill
              </div>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('traveler@gmail.com', 'TravelerPass123!')}
                  className="text-left px-3 py-2 text-xs rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-between border border-white/10"
                >
                  <span>👤 Traveler Account</span>
                  <span className="font-mono text-[#f59e0b] font-bold">Fill</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('info@kiliexpeditions.co.tz', 'OperatorPass123!')}
                  className="text-left px-3 py-2 text-xs rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-between border border-white/10"
                >
                  <span>🦁 Tour Operator (Kili Expeditions)</span>
                  <span className="font-mono text-[#f59e0b] font-bold">Fill</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin@safariasili.com', 'AdminPass123!')}
                  className="text-left px-3 py-2 text-xs rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-between border border-white/10"
                >
                  <span>🛡️ System Admin</span>
                  <span className="font-mono text-[#f59e0b] font-bold">Fill</span>
                </button>
              </div>
            </div>

            <div className="relative z-10 pt-6 flex items-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-[#f59e0b]" />
              Self-Hosted PostgreSQL 17 Session Security
            </div>
          </div>

          {/* Right Form Container */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full space-y-6">
              
              <div>
                <h1 className="text-3xl font-bold font-serif text-white">
                  Welcome Back
                </h1>
                <p className="text-sm text-gray-300 mt-1">
                  Sign in to manage your safari quote requests or tour operator leads.
                </p>
              </div>

              {/* Alerts */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3 text-red-200 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-3 text-emerald-200 text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                  <span>{success}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="glass-input pl-11"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="glass-input pl-11"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#c85a17] via-[#f59e0b] to-[#d4af37] hover:from-[#a3430b] hover:to-[#c29f2b] text-white font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 border border-white/20"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Account'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-6 border-t border-white/10 text-center">
                <p className="text-sm text-gray-400">
                  Don't have an account?{' '}
                  <Link href="/register" className="font-bold text-[#f59e0b] hover:underline">
                    Create Free Account
                  </Link>
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
