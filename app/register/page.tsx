'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Lock, User, Building2, ArrowRight, AlertCircle, CheckCircle2, Award, Compass } from 'lucide-react';

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

      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        if (role === 'OPERATOR') {
          router.push('/operator-portal');
        } else {
          router.push('/');
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
    <div className="surface-card p-8 sm:p-12 space-y-8">

      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="badge badge-brand mx-auto">
          <Compass className="h-3.5 w-3.5" />
          Join SafariRequest
        </div>
        <h1 className="text-3xl font-bold text-[var(--ink)]" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
          Create Your Account
        </h1>
        <p className="text-sm text-[var(--ink-secondary)]">
          Register as a traveler to reserve safaris, or as an agency to list tours and receive bookings.
        </p>
      </div>

      {/* Role Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setRole('TRAVELER')}
          className={`p-5 rounded-2xl border text-left transition-all flex items-start gap-4 ${
            role === 'TRAVELER'
              ? 'border-[var(--brand)] bg-[var(--brand-soft)] shadow-sm'
              : 'border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--surface-raised)]'
          }`}
        >
          <div className={`p-3 rounded-xl shrink-0 ${role === 'TRAVELER' ? 'bg-[var(--brand)] text-white' : 'bg-[var(--surface-sunk)] text-[var(--ink-secondary)]'}`}>
            <User className="h-6 w-6" />
          </div>
          <div>
            <h3 className={`font-bold text-base ${role === 'TRAVELER' ? 'text-[var(--brand-ink)]' : 'text-[var(--ink)]'}`}>Traveler Account</h3>
            <p className={`text-xs mt-1 ${role === 'TRAVELER' ? 'text-[var(--brand-ink)]' : 'text-[var(--ink-secondary)]'}`}>
              Browse safaris, reserve trips, and track agency approvals.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setRole('OPERATOR')}
          className={`p-5 rounded-2xl border text-left transition-all flex items-start gap-4 ${
            role === 'OPERATOR'
              ? 'border-[var(--brand)] bg-[var(--brand-soft)] shadow-sm'
              : 'border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--surface-raised)]'
          }`}
        >
          <div className={`p-3 rounded-xl shrink-0 ${role === 'OPERATOR' ? 'bg-[var(--brand)] text-white' : 'bg-[var(--surface-sunk)] text-[var(--ink-secondary)]'}`}>
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className={`font-bold text-base flex items-center gap-1.5 ${role === 'OPERATOR' ? 'text-[var(--brand-ink)]' : 'text-[var(--ink)]'}`}>
              Tour Agency Account
              <Award className="h-4 w-4 text-[var(--gold)]" />
            </h3>
            <p className={`text-xs mt-1 ${role === 'OPERATOR' ? 'text-[var(--brand-ink)]' : 'text-[var(--ink-secondary)]'}`}>
              List tour packages, approve reservations, and build verified reviews.
            </p>
          </div>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-[rgba(185,28,28,0.25)] bg-[var(--danger-soft)] p-4 text-sm font-medium text-[var(--danger)]">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-[rgba(22,101,52,0.25)] bg-[var(--success-soft)] p-4 text-sm font-medium text-[var(--success)]">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {role === 'OPERATOR' && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)]">
              <Award className="h-4 w-4" />
              Tour Company Details
            </div>
            <div>
              <label htmlFor="reg-company" className="form-label">Official Company / Agency Name</label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
                <input
                  id="reg-company"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Serengeti Heritage Expeditions"
                  className="form-control pl-10"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reg-first" className="form-label">First Name</label>
            <input
              id="reg-first"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Amara"
              className="form-control"
            />
          </div>
          <div>
            <label htmlFor="reg-last" className="form-label">Last Name</label>
            <input
              id="reg-last"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Mrema"
              className="form-control"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="reg-email" className="form-label">Email Address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
              <input
                id="reg-email"
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
            <label htmlFor="reg-country" className="form-label">
              {role === 'OPERATOR' ? 'Country of Operation' : 'Country of Residence'}
            </label>
            <select
              id="reg-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="form-control"
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
          <label htmlFor="reg-password" className="form-label">Create Secure Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" />
            <input
              id="reg-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="form-control pl-10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Creating Account...' : `Register as ${role === 'OPERATOR' ? 'Tour Agency' : 'Traveler'}`}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="border-t border-[var(--border-soft)] pt-5 text-center">
        <p className="text-sm text-[var(--ink-secondary)]">
          Already have an account?{' '}
          <Link href="/login" className="link">Sign In Instead</Link>
        </p>
      </div>

    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
        <Suspense fallback={
          <div className="surface-card p-12 text-center text-[var(--ink-secondary)] animate-pulse">
            Loading registration form...
          </div>
        }>
          <RegisterFormContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
