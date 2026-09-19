'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Compass, Mail, Lock, User, Building2, ArrowRight, AlertCircle, CheckCircle2, Award } from 'lucide-react';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'OPERATOR' ? 'OPERATOR' : 'TRAVELER';

  const [role, setRole] = useState<'TRAVELER' | 'OPERATOR'>(initialRole);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Tanzania');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          firstName,
          lastName,
          email,
          password,
          phone,
          country,
          companyName: role === 'OPERATOR' ? companyName : undefined,
          countryOfOrigin: role === 'OPERATOR' ? country : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account.');
      }

      setSuccess('Account created successfully! Redirecting to dashboard...');
      setTimeout(() => {
        if (role === 'OPERATOR') {
          router.push('/operator-portal');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.7)] p-8 sm:p-12 border border-white/20 space-y-8 text-white">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card-light text-[#f59e0b] text-xs font-bold uppercase tracking-wider border border-white/15">
          <Compass className="w-4 h-4 text-[#f59e0b]" />
          Join SafariAsili Marketplace
        </div>
        <h1 className="text-3xl font-bold font-serif text-white">
          Create Your Account
        </h1>
        <p className="text-sm text-gray-300">
          Register as a Traveler to request custom quotes, or as a Tour Operator to list safaris and receive leads.
        </p>
      </div>

      {/* Role Selection Toggle Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setRole('TRAVELER')}
          className={`p-5 rounded-2xl border text-left transition-all flex items-start gap-4 ${
            role === 'TRAVELER'
              ? 'border-[#f59e0b] bg-white/15 shadow-xl'
              : 'border-white/10 hover:border-white/20 bg-white/5'
          }`}
        >
          <div className={`p-3 rounded-xl ${role === 'TRAVELER' ? 'bg-[#c85a17] text-white' : 'bg-white/10 text-gray-400'}`}>
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Traveler Account</h3>
            <p className="text-xs text-gray-300 mt-1">
              Search 10,000+ safaris and request direct quotes from verified operators.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setRole('OPERATOR')}
          className={`p-5 rounded-2xl border text-left transition-all flex items-start gap-4 ${
            role === 'OPERATOR'
              ? 'border-[#f59e0b] bg-white/15 shadow-xl'
              : 'border-white/10 hover:border-white/20 bg-white/5'
          }`}
        >
          <div className={`p-3 rounded-xl ${role === 'OPERATOR' ? 'bg-[#c85a17] text-white' : 'bg-white/10 text-gray-400'}`}>
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-1.5">
              Tour Agency Account
              <Award className="w-4 h-4 text-[#d4af37]" />
            </h3>
            <p className="text-xs text-gray-300 mt-1">
              List tour packages, submit proposals to traveler inquiries, and build verified reviews.
            </p>
          </div>
        </button>
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
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {role === 'OPERATOR' && (
          <div className="glass-card-light p-5 rounded-2xl border border-white/15 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#f59e0b] uppercase tracking-wider">
              <Award className="w-4 h-4 text-[#d4af37]" />
              Tour Company Details
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Official Company / Agency Name
              </label>
              <div className="relative">
                <Building2 className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Serengeti Heritage Expeditions"
                  className="glass-input pl-11"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Amara"
              className="glass-input"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Mrema"
              className="glass-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Country of Residence / Operation
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="glass-input"
            >
              <option value="Tanzania">Tanzania</option>
              <option value="Kenya">Kenya</option>
              <option value="South Africa">South Africa</option>
              <option value="Uganda">Uganda</option>
              <option value="Botswana">Botswana</option>
              <option value="Rwanda">Rwanda</option>
              <option value="Namibia">Namibia</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
            Create Secure Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="glass-input pl-11"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#c85a17] via-[#f59e0b] to-[#d4af37] hover:from-[#a3430b] text-white font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 border border-white/20"
        >
          {loading ? 'Creating Account...' : `Register as ${role === 'OPERATOR' ? 'Tour Agency' : 'Traveler'}`}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-4 text-center">
        <p className="text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#f59e0b] hover:underline">
            Sign In Instead
          </Link>
        </p>
      </div>

    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-white relative">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-40 pointer-events-none"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')` }}
      />
      <div className="fixed inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/70 to-[#0b0c10]/40 pointer-events-none" />

      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 relative z-10">
        <Suspense fallback={
          <div className="glass-card rounded-3xl p-12 text-center text-gray-300 animate-pulse">
            Loading Registration Form...
          </div>
        }>
          <RegisterFormContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
