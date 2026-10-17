import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import OperatorVerificationTable from '@/components/OperatorVerificationTable';
import { ShieldCheck, Users, Building2, MapPin, Award, CheckCircle2 } from 'lucide-react';

export default async function AdminPage() {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  // Fetch metrics & operators
  const [totalUsers, totalOperators, totalTours, totalDestinations, operators] = await Promise.all([
    prisma.user.count(),
    prisma.operator.count(),
    prisma.tour.count(),
    prisma.destination.count(),
    prisma.operator.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        countryOfOrigin: true,
        registrationNumber: true,
        isVerified: true,
        averageRating: true,
        totalReviews: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Admin Header */}
        <div className="surface-dark rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80')` }} />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[var(--brand-light)] text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-md border border-white/15">
              <ShieldCheck className="w-4 h-4 text-[var(--brand-light)]" />
              <span>Platform Administration</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white">
              SafariRequest Control Center
            </h1>
            <p className="text-sm text-white/85 mt-2 max-w-xl font-light">
              Operator verification queue, review moderation, database health, and inquiry distribution engine.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="surface-card p-6 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Registered Users</p>
              <h3 className="text-2xl font-bold font-display text-[var(--brand-deep)]">{totalUsers}</h3>
            </div>
          </div>

          <div className="surface-card p-6 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Tour Operators</p>
              <h3 className="text-2xl font-bold font-display text-[var(--brand-deep)]">{totalOperators}</h3>
            </div>
          </div>

          <div className="surface-card p-6 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Safari Packages</p>
              <h3 className="text-2xl font-bold font-display text-[var(--brand-deep)]">{totalTours}</h3>
            </div>
          </div>

          <div className="surface-card p-6 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">National Parks</p>
              <h3 className="text-2xl font-bold font-display text-[var(--brand-deep)]">{totalDestinations}</h3>
            </div>
          </div>
        </div>

        {/* Verification Queue Component */}
        <OperatorVerificationTable initialOperators={operators} />

      </main>

      <Footer />
    </div>
  );
}
