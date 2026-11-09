import { getSession } from '@/lib/auth';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import OperatorVerificationTable from '@/components/OperatorVerificationTable';
import AdminLoginForm from '@/components/AdminLoginForm';
import { parseTalaData } from '@/lib/tala-verification';
import { ShieldCheck, Users, Building2, MapPin, Award, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();

  // If user is not authenticated as ADMIN, display the dedicated Admin Login portal
  if (!session || session.role !== 'ADMIN') {
    return <AdminLoginForm currentRole={session?.role} currentEmail={session?.email} />;
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
        licenseDocumentUrl: true,
        isVerified: true,
        verificationDate: true,
        averageRating: true,
        totalReviews: true,
        serviceSummary: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    }),
  ]);

  // Compute pending verifications
  const pendingCount = operators.filter((op) => {
    if (op.isVerified) return false;
    const tala = parseTalaData(op.serviceSummary, op.registrationNumber, op.licenseDocumentUrl, op.isVerified);
    return tala.status === 'PENDING';
  }).length;

  const verifiedCount = operators.filter((op) => op.isVerified).length;

  const serializedOperators = operators.map((op) => ({
    ...op,
    createdAt: op.createdAt ? op.createdAt.toISOString() : undefined,
    verificationDate: op.verificationDate ? op.verificationDate.toISOString() : null,
  }));

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
              <span>Platform Owner Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white">
              SafariRequest Owner Control Center
            </h1>
            <p className="text-sm text-white/85 mt-2 max-w-xl font-light">
              Review and certify safari tour operators via governmental TALA documents, moderate customer reviews, and monitor ecosystem health.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <Link
              href="/admin/reviews"
              className="btn btn-secondary text-xs inline-flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Review Moderation Queue</span>
            </Link>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-black/10 pb-3">
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--brand)] text-white shadow-sm flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>TALA Agency Verifications</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-amber-950 font-black animate-pulse">
                {pendingCount} new
              </span>
            )}
          </Link>

          <Link
            href="/admin/reviews"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#344C49] hover:bg-[#F7F6F1] border border-black/5 shadow-2xs flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-[var(--brand)]" />
            <span>Customer Review Moderation</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          
          <div className="surface-card p-5 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Registered Users</p>
              <h3 className="text-2xl font-bold font-display text-[var(--brand-deep)]">{totalUsers}</h3>
            </div>
          </div>

          <div className="surface-card p-5 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Total Agencies</p>
              <h3 className="text-2xl font-bold font-display text-[var(--brand-deep)]">{totalOperators}</h3>
            </div>
          </div>

          {/* Pending Reviews Stat (urgent if > 0) */}
          <div className={`p-5 rounded-2xl border shadow-sm flex items-center gap-4 ${
            pendingCount > 0
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'surface-card border-black/5'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
              pendingCount > 0 ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Pending TALA</p>
              <h3 className="text-2xl font-bold font-display text-amber-900">{pendingCount}</h3>
            </div>
          </div>

          <div className="surface-card p-5 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Verified Active</p>
              <h3 className="text-2xl font-bold font-display text-emerald-800">{verifiedCount}</h3>
            </div>
          </div>

          <div className="surface-card p-5 rounded-2xl border border-black/5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)] flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Safari Tours</p>
              <h3 className="text-2xl font-bold font-display text-[var(--brand-deep)]">{totalTours}</h3>
            </div>
          </div>

        </div>

        {/* Verification Queue & Document Inspection Component */}
        <OperatorVerificationTable initialOperators={serializedOperators} />

      </main>

      <Footer />
    </div>
  );
}
